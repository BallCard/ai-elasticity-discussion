import React from "react";
import data from "./data/training.json";
import {SOURCE_HAN_FAMILY} from "./load-fonts.js";

// Every position, opacity and path is a pure function of the requested frame.
// No clock, random values, mutable simulation state or CSS animation is used.
const C = {bg: "#faf9f5", panel: "#f0eee6", text: "#25231f", muted: "#747169",
  line: "#ddd9ce", teal: "#c66b4e", orange: "#3b3935", purple: "#65816d"};
const FONT = SOURCE_HAN_FAMILY;
const MATH = SOURCE_HAN_FAMILY;
const clamp = x => Math.max(0, Math.min(1, x));
const ease = x => {const t = clamp(x); return t * t * (3 - 2 * t);};
const enter = (t, delay = 0, length = .65) => ease((t - delay) / length);
const lerp = (a, b, t) => a + (b - a) * t;
const percent = n => `${(n * 100).toFixed(n < .001 ? 4 : 2)}%`;
const scientific = n => {
  const [mantissa, exponent] = n.toExponential(2).split("e");
  const superscripts = {"-": "⁻", "+": "", "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹"};
  return `${mantissa} × 10${String(Number(exponent)).split("").map(c => superscripts[c]).join("")}`;
};

const stages = [
  {start: 0, end: 6, tag: "01 / 问题", title: "先把问题说清楚", sub: "几何、材料、载荷与边界，共同定义一个弹性问题"},
  {start: 6, end: 12, tag: "02 / 方程", title: "三类关系，合成一个方程", sub: "材料与假设固定，求解函数必须满足物理关系"},
  {start: 12, end: 18, tag: "03 / 网络", title: "用网络表示解，用方程约束它", sub: "学的是一个可调函数；这里没有提供解析位移标签"},
  {start: 18, end: 29, tag: "04 / 训练", title: "让一个函数，逐渐接近物理解", sub: "构造示意：候选函数 → 检查残差 → 调整函数；实测结果在最后展示"},
  {start: 29, end: 36, tag: "05 / 核验", title: "看着相似，还要独立核验", sub: "在未参与优化的 401 个位置，检查解和它的空间导数"},
];

// Use real glyphs from Source Han Serif CN for indices as well. Its font files
// omit several Unicode super/subscripts and calligraphic L, so compose these
// from ordinary digits rather than allowing another font to substitute them.
const indexedText = value => {
  if (typeof value !== "string") return value;
  const sub = {"₀": "0", "₁": "1", "₂": "2", "₃": "3", "₄": "4", "₅": "5", "₆": "6", "₇": "7", "₈": "8", "₉": "9"};
  const sup = {"⁻": "−", "⁺": "+", "⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4", "⁵": "5", "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9"};
  return value.replaceAll("ℒ", "L").split(/([₀₁₂₃₄₅₆₇₈₉]+|[⁻⁺⁰¹²³⁴⁵⁶⁷⁸⁹]+)/g).map((part, i) => {
    if (part[0] in sub) return <tspan key={i} baselineShift="sub" fontSize="65%">{[...part].map(c => sub[c]).join("")}</tspan>;
    if (part[0] in sup) return <tspan key={i} baselineShift="super" fontSize="65%">{[...part].map(c => sup[c]).join("")}</tspan>;
    return part;
  });
};

const Text = ({x, y, size = 36, fill = C.text, anchor = "start", math = false, children, weight = 400, ...rest}) =>
  <text x={x} y={y} fontSize={size} fill={fill} textAnchor={anchor}
    fontFamily={math ? MATH : FONT} fontWeight={weight} {...rest}>{indexedText(children)}</text>;

const Reveal = ({t, delay = 0, children}) => {
  const p = enter(t, delay);
  return <g opacity={p} transform={`translate(0 ${24 * (1 - p)})`}>{children}</g>;
};

const Support = ({x, side, progress}) => <g opacity={progress}>
  <line x1={x} x2={x} y1={450} y2={550} stroke={C.text} strokeWidth={6}/>
  {Array.from({length: 7}, (_, i) => <line key={i} x1={x} y1={450 + i * 15}
    x2={x + side * 24} y2={435 + i * 15} stroke={C.muted} strokeWidth={3}/>)}
</g>;

const Problem = ({t}) => {
  const rod = enter(t, 0, 1.2);
  return <>
    <Reveal t={t}><Text x={960} y={300} size={40} anchor="middle" fill={C.muted}>均匀线弹性杆 · 轴向响应</Text></Reveal>
    <rect x={330} y={476} width={1260 * rod} height={48} rx={7} fill={C.teal} opacity={.17}/>
    <line x1={330} x2={330 + 1260 * rod} y1={500} y2={500} stroke={C.teal} strokeWidth={6}/>
    <Support x={330} side={-1} progress={enter(t, .3)}/>
    <Support x={1590} side={1} progress={enter(t, .6)}/>
    {Array.from({length: 13}, (_, i) => {
      const xi = (i + 1) / 14, x = 330 + 1260 * xi;
      const length = 32 + 50 * Math.sin(Math.PI * xi), a = enter(t, .8 + i * .045);
      return <g key={i} opacity={a} transform={`translate(${x} 408)`}>
        <line x1={-length / 2} x2={length / 2} y1={0} y2={0} stroke={C.orange} strokeWidth={4}/>
        <path d={`M${length / 2 - 12},-9 L${length / 2},0 L${length / 2 - 12},9`} fill="none" stroke={C.orange} strokeWidth={4}/>
      </g>;
    })}
    <Reveal t={t} delay={1.2}><Text x={960} y={365} math size={48} anchor="middle" fill={C.orange}>q(x) = q₀ sin(πx/L)</Text></Reveal>
    <Reveal t={t} delay={1.7}>
      <line x1={330} x2={1590} y1={590} y2={590} stroke={C.line} strokeWidth={2}/>
      <Text x={330} y={632} size={29} anchor="middle">x = 0</Text>
      <Text x={1590} y={632} size={29} anchor="middle">x = L</Text>
      <Text x={960} y={632} size={32} anchor="middle" fill={C.muted}>E、A、L 已知</Text>
    </Reveal>
    <Reveal t={t} delay={2.2}>
      <Text x={960} y={768} math size={66} anchor="middle">u(0) = u(L) = 0</Text>
      <Text x={960} y={829} size={31} fill={C.muted} anchor="middle">未知的是：每个空间位置的轴向位移 u(x)</Text>
    </Reveal>
  </>;
};

const Equations = ({t}) => {
  const cards = [{label: "几何关系", math: "ε = du/dx"}, {label: "本构关系", math: "N = EA · ε"}, {label: "平衡关系", math: "dN/dx + q = 0"}];
  return <>
    {cards.map((card, i) => <Reveal key={card.label} t={t} delay={i * .55}>
      <rect x={200 + i * 520} y={305} width={480} height={190} rx={2} fill={C.panel}/>
      <Text x={440 + i * 520} y={359} size={30} fill={C.muted} anchor="middle">{card.label}</Text>
      <Text x={440 + i * 520} y={434} size={52} math anchor="middle" fill={C.teal}>{card.math}</Text>
    </Reveal>)}
    <Reveal t={t} delay={1.7}>
      <path d="M440 524 L440 558 L1480 558 L1480 524 M960 558 L960 598" stroke={C.line} strokeWidth={3} fill="none"/>
      <Text x={960} y={665} size={79} math anchor="middle">EAu″ + q = 0</Text>
    </Reveal>
    <Reveal t={t} delay={2.8}>
      <Text x={960} y={735} size={28} fill={C.muted} anchor="middle">ξ = x/L，U = u / [q₀L²/(EA)]</Text>
      <Text x={960} y={825} size={64} math anchor="middle" fill={C.orange}>U″(ξ) + sin(πξ) = 0</Text>
      <Text x={960} y={885} size={28} fill={C.muted} anchor="middle">无量纲端点：U(0) = U(1) = 0</Text>
    </Reveal>
  </>;
};

const Network = ({t}) => {
  const columns = [[{x: 280, y: 490}], [360, 445, 530, 615].map(y => ({x: 535, y})),
    [360, 445, 530, 615].map(y => ({x: 800, y})), [{x: 1055, y: 490}]];
  return <>
    {columns.slice(0, -1).flatMap((col, i) => col.flatMap((a, j) => columns[i + 1].map((b, k) =>
      <line key={`${i}-${j}-${k}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
        stroke={C.teal} opacity={enter(t, .35 + i * .3) * .22} strokeWidth={2}/>)))}
    {columns.flatMap((col, i) => col.map((p, j) => <g key={`${i}-${j}`} opacity={enter(t, i * .3)}>
      <circle cx={p.x} cy={p.y} r={i === 0 || i === 3 ? 37 : 24} fill={C.panel} stroke={C.teal} strokeWidth={3}/>
      <circle cx={p.x} cy={p.y} r={9} fill={C.teal} opacity={.3 + .6 * (.5 + .5 * Math.sin(t * 2.6 - i * 1.1 - j * .25))}/>
    </g>))}
    <Reveal t={t}>
      <Text x={280} y={310} size={43} math anchor="middle">ξ</Text>
      <Text x={280} y={700} size={30} fill={C.muted} anchor="middle">空间坐标</Text>
    </Reveal>
    <Reveal t={t} delay={1.2}>
      <Text x={1055} y={310} size={43} math anchor="middle">Nθ(ξ)</Text>
      <Text x={1055} y={700} size={30} fill={C.muted} anchor="middle">网络函数</Text>
      <Text x={665} y={775} size={28} fill={C.muted} anchor="middle">1 → 16 → 16 → 1 · tanh</Text>
      <Text x={665} y={820} size={25} fill={C.muted} anchor="middle">隐藏节点仅作示意</Text>
    </Reveal>
    <Reveal t={t} delay={1.6}>
      <rect x={1220} y={322} width={510} height={178} rx={2} fill={C.panel}/>
      <Text x={1475} y={368} size={27} fill={C.muted} anchor="middle">硬边界位移函数</Text>
      <Text x={1475} y={441} math size={45} anchor="middle" fill={C.teal}>Uθ = ξ(1−ξ)Nθ</Text>
      <Text x={1475} y={553} size={27} fill={C.muted} anchor="middle">空间求导 → 方程残差</Text>
    </Reveal>
    <Reveal t={t} delay={2.6}>
      <Text x={1475} y={627} math size={46} anchor="middle" fill={C.orange}>r = Uθ″ + sin(πξ)</Text>
      <Text x={1475} y={721} math size={52} anchor="middle">ℒ = mean(r²)</Text>
      <Text x={1475} y={784} size={28} fill={C.muted} anchor="middle">调整 θ，让残差变小</Text>
    </Reveal>
  </>;
};

const pathFor = (values, box, domain) => values.map((v, i) =>
  `${i ? "L" : "M"}${box.x + data.x[i] * box.w},${box.y + box.h * (domain[1] - v) / (domain[1] - domain[0])}`).join(" ");

const Plot = ({box, values, exact, domain, label, residual = false}) => {
  const {x, y, w, h} = box;
  return <g>
    <rect x={x} y={y} width={w} height={h} rx={0} fill="none" stroke={C.line} strokeWidth={2}/>
    {[0, .25, .5, .75, 1].map(v => <g key={v}>
      <line x1={x + v * w} x2={x + v * w} y1={y} y2={y + h} stroke={C.line} strokeWidth={1}/>
      <Text x={x + v * w} y={y + h + 42} size={24} anchor="middle" fill={C.muted}>{v}</Text>
    </g>)}
    {Array.from({length: 5}, (_, i) => {
      const v = lerp(domain[0], domain[1], i / 4), yy = y + h - i * h / 4;
      return <g key={i}><line x1={x} x2={x + w} y1={yy} y2={yy} stroke={C.line} strokeWidth={1}/>
        <Text x={x - 20} y={yy + 8} size={24} anchor="end" fill={C.muted}>{v.toFixed(residual ? 1 : 2)}</Text></g>;
    })}
    <path d={pathFor(values, box, domain)} fill="none" stroke={residual ? C.purple : C.teal} strokeWidth={5} strokeLinejoin="round"/>
    {exact ? <path d={pathFor(exact, box, domain)} fill="none" stroke={C.orange} strokeWidth={3.5} strokeDasharray="14 11"/> : null}
    <Text x={x + w / 2} y={y + h + 90} size={27} anchor="middle" fill={C.muted}>空间位置 ξ</Text>
    <Text x={x} y={y - 28} size={30} fill={C.muted}>{label}</Text>
  </g>;
};

const trainingAt = t => {
  // Deliberately constructed teaching path, clearly labelled in the scene.
  // Every candidate satisfies the end conditions. Its residual is calculated
  // analytically, rather than inventing optimizer logs or experiment metrics.
  const p = ease(clamp(t / 10.4));
  const amplitude = .27 * (1 - p) ** 1.6, tilt = .15 * (1 - p) ** 1.3;
  const k = 3 * Math.PI;
  const u = data.x.map((x, i) => data.exact_u[i] + amplitude * x * (1 - x) * Math.sin(k * x)
    + tilt * x * (1 - x) * (2 * x - 1));
  const r = data.x.map(x => amplitude * (-2 * Math.sin(k * x) + 2 * (1 - 2 * x) * k * Math.cos(k * x)
    - x * (1 - x) * k * k * Math.sin(k * x)) + tilt * (6 - 12 * x));
  const squaredError = u.reduce((sum, v, i) => sum + (v - data.exact_u[i]) ** 2, 0);
  const squaredReference = data.exact_u.reduce((sum, v) => sum + v * v, 0);
  return {u, r, relativeError: Math.sqrt(squaredError / squaredReference),
    residualRms: Math.sqrt(r.reduce((sum, v) => sum + v * v, 0) / r.length), progress: p};
};

const Training = ({t}) => {
  const {u, r, relativeError, residualRms, progress} = trainingAt(t);
  return <>
    <Plot box={{x: 230, y: 345, w: 900, h: 480}} values={u} exact={data.exact_u} domain={[-.005, .125]} label="位移 U（无量纲）"/>
    <line x1={775} x2={820} y1={306} y2={306} stroke={C.teal} strokeWidth={5}/>
    <Text x={835} y={315} size={26}>候选函数</Text>
    <line x1={1000} x2={1045} y1={306} y2={306} stroke={C.orange} strokeWidth={4} strokeDasharray="10 6"/>
    <Text x={1060} y={315} size={26}>参考</Text>
    <Plot box={{x: 1330, y: 345, w: 380, h: 230}} values={r} domain={[-8, 8]} label="构造函数的方程残差" residual/>
    <Text x={1280} y={715} size={28} fill={C.muted}>示意调整</Text>
    <Text x={1710} y={715} size={46} math anchor="end">{Math.round(progress * 100)}%</Text>
    <Text x={1280} y={789} size={27} fill={C.muted}>示意相对误差</Text>
    <Text x={1710} y={789} size={46} math anchor="end" fill={C.teal}>{percent(relativeError)}</Text>
    <Text x={1280} y={860} size={27} fill={C.muted}>示意残差 RMS</Text>
    <Text x={1710} y={860} size={40} math anchor="end" fill={C.purple}>{residualRms.toExponential(2)}</Text>
    <Text x={230} y={948} size={25} fill={C.muted}>构造的教学示意 · 用于解释优化方向 · 不是实验训练记录</Text>
  </>;
};

const Validation = ({t}) => {
  const f = data.snapshots[data.snapshots.length - 1];
  const values = [{label: "位移相对 L₂ 误差", value: percent(f.relative_u_l2), color: C.teal},
    {label: "应力 / 导数相对 L₂ 误差", value: percent(f.relative_derivative_l2), color: C.orange},
    {label: "独立残差 RMS", value: scientific(f.residual_rms), color: C.purple}];
  return <>
    {values.map((v, i) => <Reveal key={v.label} t={t} delay={.3 + i * .35}>
      <Text x={380 + i * 580} y={394} size={29} fill={C.muted} anchor="middle">{v.label}</Text>
      <Text x={380 + i * 580} y={506} size={i === 2 ? 78 : 98} math weight={500} fill={v.color} anchor="middle">{v.value}</Text>
    </Reveal>)}
    <Reveal t={t} delay={1.9}>
      <line x1={220} x2={1700} y1={577} y2={577} stroke={C.line} strokeWidth={2}/>
      <Text x={960} y={670} size={49} weight={500} anchor="middle">实测核验：401 个独立位置 · 两端位移为 0</Text>
      <Text x={960} y={736} size={31} fill={C.muted} anchor="middle">参考解：U*(ξ) = sin(πξ)/π²；训练没有使用它的位移标签</Text>
    </Reveal>
    <Reveal t={t} delay={3.1}>
      <Text x={960} y={848} size={36} anchor="middle" fill={C.orange}>一个平滑的一维算例；新载荷、新材料、新几何还需验证。</Text>
      <Text x={960} y={913} size={30} anchor="middle" fill={C.muted}>可信性来自：物理定义、独立误差与明确的适用范围。</Text>
    </Reveal>
  </>;
};

const contents = [Problem, Equations, Network, Training, Validation];

export const MotionScene = ({frame, fps, durationInFrames, layout}) => {
  // Stretch the entire storyboard together if duration is edited in Studio.
  const seconds = frame / Math.max(1, durationInFrames - 1) * 36;
  const active = Math.min(4, stages.findIndex(s => seconds < s.end) < 0 ? 4 : stages.findIndex(s => seconds < s.end));
  const stage = stages[active], scale = Math.min(layout.videoWidth / 1920, layout.videoHeight / 1080);
  return <div style={{width: "100%", height: "100%", background: C.bg, overflow: "hidden", fontFamily: FONT}}>
    <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{transform: `scale(${scale})`, transformOrigin: "0 0"}}>
      <rect width={1920} height={1080} fill={C.bg}/>
      <Text x={112} y={88} size={27} fill={C.teal}>{stage.tag}</Text>
      <Text x={112} y={171} size={65} weight={500}>{stage.title}</Text>
      <Text x={112} y={236} size={31} fill={C.muted}>{stage.sub}</Text>
      {stages.map((s, i) => <g key={s.tag} opacity={i === active ? 1 : .45}>
        <Text x={1310 + i * 112} y={88} size={25} fill={i === active ? C.teal : C.muted}>{s.tag.split(" / ")[1]}</Text>
        {i === active ? <line x1={1310 + i * 112} x2={1364 + i * 112} y1={103} y2={103} stroke={C.teal} strokeWidth={2}/> : null}
      </g>)}
      {stages.map((s, i) => {
        const inside = seconds >= s.start && seconds <= s.end + .3;
        if (!inside) return null;
        const Component = contents[i];
        const fadeIn = i === 0 ? 1 : enter(seconds, s.start, .28);
        const fadeOut = i === 4 ? 1 : 1 - enter(seconds, s.end - .22, .45);
        return <g key={s.tag} opacity={fadeIn * fadeOut}><Component t={seconds - s.start}/></g>;
      })}
      <rect x={112} y={989} width={1696} height={4} fill={C.line}/>
      <rect x={112} y={989} width={1696 * clamp(seconds / 36)} height={4} fill={C.teal}/>
      <Text x={112} y={1040} size={25} fill={C.muted}>AI 与弹性力学 · PINN 教学算例</Text>
      <Text x={1808} y={1040} size={25} fill={C.muted} anchor="end">{Math.min(36, Math.floor(frame / fps))} s / 36 s</Text>
    </svg>
  </div>;
};
