"""Render recorded training as a shareable GIF and final static figure."""
from pathlib import Path
import json

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
from PIL import Image

HERE = Path(__file__).resolve().parent
data = json.loads((HERE / "training-data.json").read_text(encoding="utf-8"))
plt.rcParams.update({"font.family": "DejaVu Sans", "font.size": 11})
x = np.array(data["x"])
frames = data["snapshots"]
fig, axes = plt.subplots(1, 2, figsize=(12, 5), dpi=100)
fig.subplots_adjust(left=.08, right=.97, top=.77, bottom=.16, wspace=.31)
fig.patch.set_facecolor("#f5f7fa")
title = fig.suptitle("A neural network constrained by elasticity", x=.08, ha="left", y=.96, fontsize=20)
caption = fig.text(.08, .87, "", fontsize=12)
for ax in axes:
    ax.set_facecolor("white")
    ax.grid(alpha=.16)
    ax.set_xlabel("Spatial coordinate xi [dimensionless]")
axes[0].set_ylabel("Displacement U [dimensionless]")
axes[1].set_ylabel("Equilibrium residual [dimensionless]")
prediction, = axes[0].plot(x, frames[0]["u"], color="#007a72", lw=2.4, label="PINN prediction")
axes[0].plot(x, data["exact_u"], color="#9d4b14", lw=2, ls="--", label="Analytical reference")
residual, = axes[1].plot(x, frames[0]["r"], color="#7050b6", lw=2.2)
axes[0].legend(loc="lower left", frameon=False)
for ax, key in zip(axes, ("u", "r")):
    values = np.asarray([f[key] for f in frames])
    low, high = min(values.min(), 0), max(values.max(), .102 if key == "u" else 0)
    pad = (high - low) * .1
    ax.set_ylim(low - pad, high + pad)
fig.text(.08, .04, "Recorded optimization, not physical time | 64 collocation points | 401 independent validation points", fontsize=10, color="#4c6170")
images = []
for f in frames:
    prediction.set_ydata(f["u"])
    residual.set_ydata(f["r"])
    caption.set_text(f"Iteration {f['step']:>4} / 3000  |  Relative displacement error: {f['relative_u_l2']:.4%}  |  Residual RMS: {f['residual_rms']:.3e}")
    fig.canvas.draw()
    rgba = np.asarray(fig.canvas.buffer_rgba())
    images.append(Image.fromarray(rgba.copy()).convert("RGB"))
durations = [300] * len(images)
durations[0] = 1500
durations[-1] = 2500
# No loop extension: play once; the final frame stays visible in readers.
images[0].save(HERE / "training.gif", save_all=True, append_images=images[1:], duration=durations, optimize=True)
fig.savefig(HERE / "final-result.png", dpi=160, facecolor=fig.get_facecolor())
plt.close(fig)
print(f"Exported {len(images)} frames; duration {sum(durations)/1000:.1f}s")
