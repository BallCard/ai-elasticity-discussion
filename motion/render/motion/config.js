export const DEFAULT_LAYOUT_PARAMS = Object.freeze({
  videoWidth: 1920,
  videoHeight: 1080,
});

export const DEFAULT_ANIMATION_PARAMS = Object.freeze({
  title: "AI 与弹性力学：从方程到可信的解",
  subtitle: "两端固定的弹性杆 · PINN 教学算例",
  badgeText: "弹性力学讨论课",
  cardDarkMode: false,
  durationSeconds: 36,
  speed: 1,
  cardTiltMax: 0,
});

export const DEFAULT_MOTION_PROPS = Object.freeze({
  ...DEFAULT_LAYOUT_PARAMS,
  ...DEFAULT_ANIMATION_PARAMS,
});
