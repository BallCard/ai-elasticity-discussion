"""Train a genuine 1D elasticity PINN and export its recorded trajectory.

No analytical displacement labels enter optimization. Exact fields are evaluated
only in snapshot()/validation. Run from any directory; outputs stay beside this
file. The browser only replays exported snapshots and never trains a model.
"""
from pathlib import Path
import json
import math
import time

import torch
from torch import nn
import numpy as np

HERE = Path(__file__).resolve().parent
SEED = 42
STEPS = 3000
SNAPSHOT_STEPS = sorted(set([0, 1, 5, 10, 20, 40, 60, 100, 150, 200]
                             + list(range(250, STEPS + 1, 50))))
torch.set_default_dtype(torch.float64)
torch.set_num_threads(1)
torch.manual_seed(SEED)
np.random.seed(SEED)

model = nn.Sequential(nn.Linear(1, 16), nn.Tanh(), nn.Linear(16, 16),
                      nn.Tanh(), nn.Linear(16, 1))
# Random interior training points; the validation grid is separate.
x_train = torch.rand(64, 1, requires_grad=True)
x_test = torch.linspace(0, 1, 401).reshape(-1, 1).requires_grad_(True)


def fields(x):
    u = x * (1 - x) * model(x)
    du = torch.autograd.grad(u, x, torch.ones_like(u), create_graph=True)[0]
    ddu = torch.autograd.grad(du, x, torch.ones_like(du), create_graph=True)[0]
    residual = ddu + torch.sin(math.pi * x)
    return u, du, residual


def rounded(arr):
    return np.round(np.asarray(arr).reshape(-1), 9).tolist()


def vector_norm(arr):
    # Basic array reductions avoid loading a second BLAS/OpenMP runtime in some
    # Windows distributions that mix MKL-backed NumPy with CPU PyTorch.
    return float(np.sqrt(np.sum(np.asarray(arr) ** 2)))


def snapshot(step, training_loss):
    u, du, r = fields(x_test)
    xi = x_test.detach().numpy().ravel()
    u, du, r = [v.detach().numpy().ravel() for v in (u, du, r)]
    exact = np.sin(math.pi * xi) / math.pi**2
    dexact = np.cos(math.pi * xi) / math.pi
    metrics = {
        "relative_u_l2": vector_norm(u - exact) / vector_norm(exact),
        "relative_derivative_l2": vector_norm(du - dexact) / vector_norm(dexact),
        "max_abs_u_error": float(np.max(np.abs(u - exact))),
        "residual_rms": float(np.sqrt(np.mean(r**2))),
        "residual_max_abs": float(np.max(np.abs(r))),
        "boundary_max_abs": float(max(abs(u[0]), abs(u[-1]))),
    }
    return {"step": step, "train_loss": float(training_loss),
            "u": rounded(u[::4]), "du": rounded(du[::4]),
            "r": rounded(r[::4]), **metrics}


def fem_reference(elements=100):
    """Linear axial bar FEM, EA=L=q0=1, 3-point Gauss load integration."""
    nodes = np.linspace(0, 1, elements + 1)
    h = 1 / elements
    stiffness = np.zeros((elements + 1, elements + 1))
    load = np.zeros(elements + 1)
    gauss = np.array([-math.sqrt(3 / 5), 0, math.sqrt(3 / 5)])
    weights = np.array([5 / 9, 8 / 9, 5 / 9])
    shape = np.vstack(((1 - gauss) / 2, (1 + gauss) / 2))
    for element in range(elements):
        indices = np.array([element, element + 1])
        stiffness[np.ix_(indices, indices)] += np.array([[1, -1], [-1, 1]]) / h
        xq = nodes[element] + (gauss + 1) * h / 2
        load[indices] += (shape * (weights * np.sin(math.pi * xq))).sum(axis=1) * h / 2
    start = time.perf_counter()
    values = np.zeros(elements + 1)
    # The assembled system is tridiagonal. Thomas elimination needs no BLAS.
    diagonal = np.diag(stiffness)[1:-1].copy()
    off = -1 / h
    rhs = load[1:-1].copy()
    for i in range(1, elements - 1):
        factor = off / diagonal[i - 1]
        diagonal[i] -= factor * off
        rhs[i] -= factor * rhs[i - 1]
    interior = np.zeros(elements - 1)
    interior[-1] = rhs[-1] / diagonal[-1]
    for i in range(elements - 3, -1, -1):
        interior[i] = (rhs[i] - off * interior[i + 1]) / diagonal[i]
    values[1:-1] = interior
    elapsed = time.perf_counter() - start
    test = x_test.detach().numpy().ravel()
    predicted = np.interp(test, nodes, values)
    slopes = np.diff(values) / h
    # At interior element edges take the element on the right; at x=1 the last.
    indices = np.minimum(np.floor(test / h + 1e-10).astype(int), elements - 1)
    derivative = slopes[indices]
    exact = np.sin(math.pi * test) / math.pi**2
    dexact = np.cos(math.pi * test) / math.pi
    return {
        "elements": elements,
        "relative_u_l2": vector_norm(predicted - exact) / vector_norm(exact),
        "relative_derivative_l2": vector_norm(derivative - dexact) / vector_norm(dexact),
        "max_abs_u_error": float(np.max(np.abs(predicted - exact))),
        "linear_solve_seconds_only": elapsed,
        "u": rounded(predicted[::4]),
        "note": "FEM derivative is elementwise constant; values at interfaces use the right element. Timing excludes assembly and is not a performance benchmark.",
    }


def main():
    optimizer = torch.optim.Adam(model.parameters(), lr=0.002)
    initial_loss = fields(x_train)[2].square().mean().item()
    snapshots = [snapshot(0, initial_loss)]
    start = time.perf_counter()
    for step in range(1, STEPS + 1):
        optimizer.zero_grad(set_to_none=True)
        # x_train is a leaf used only for spatial differentiation.
        x_train.grad = None
        loss = fields(x_train)[2].square().mean()
        loss.backward()
        optimizer.step()
        if step in SNAPSHOT_STEPS:
            current_loss = fields(x_train)[2].square().mean().item()
            snapshots.append(snapshot(step, current_loss))
    elapsed = time.perf_counter() - start
    fem = fem_reference()
    config = {
        "seed": SEED, "steps": STEPS, "dtype": "float64", "device": "cpu",
        "network": "1-16-16-1, tanh hidden layers", "parameters": sum(p.numel() for p in model.parameters()),
        "optimizer": "Adam", "learning_rate": 0.002, "train_points": 64,
        "validation_points": 401, "export_points": 101, "boundary": "hard, U=xi(1-xi)N",
        "equation": "U''+sin(pi*xi)=0, U(0)=U(1)=0",
        "training_labels": "none", "torch": torch.__version__, "numpy": np.__version__,
        "training_seconds_including_snapshots": elapsed,
    }
    data = {"config": config, "x": rounded(np.linspace(0, 1, 101)),
            "exact_u": rounded(np.sin(math.pi * np.linspace(0, 1, 101)) / math.pi**2),
            "exact_du": rounded(np.cos(math.pi * np.linspace(0, 1, 101)) / math.pi),
            "train_x": rounded(x_train.detach().numpy()), "snapshots": snapshots, "fem": fem}
    metrics = {"config": config, "initial": {k: v for k, v in snapshots[0].items() if k not in ("u", "du", "r")},
               "final": {k: v for k, v in snapshots[-1].items() if k not in ("u", "du", "r")},
               "fem": {k: v for k, v in fem.items() if k != "u"},
               "limits": "One seed, one smooth 1D instance. Sampled validation, no global proof, no out-of-distribution test, no engineering deployment."}
    # Validate the meaningful claims before writing a successful result.
    final = metrics["final"]
    assert final["boundary_max_abs"] < 1e-12
    assert final["relative_u_l2"] < 0.01, final
    assert final["relative_derivative_l2"] < 0.02, final
    assert final["residual_rms"] < 0.05, final
    assert all(np.isfinite(s["residual_rms"]) for s in snapshots)
    (HERE / "training-data.json").write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    (HERE / "training-data.js").write_text("window.PINN_DEMO_DATA = " + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + ";\n", encoding="utf-8")
    (HERE / "metrics.json").write_text(json.dumps(metrics, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(metrics, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
