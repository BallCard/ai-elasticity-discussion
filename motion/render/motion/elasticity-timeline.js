import { DEFAULT_MOTION_PROPS } from "./config.js";

const finite = (value, fallback) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const bounded = (value, min, max) => Math.min(max, Math.max(min, value));

export const resolveMotionSceneContext = (params = {}) => ({
  title: params.title || DEFAULT_MOTION_PROPS.title,
  durationSeconds: bounded(finite(params.durationSeconds, 36), 1, 120),
  layout: {
    videoWidth: Math.round(bounded(finite(params.videoWidth, 1920), 480, 3840)),
    videoHeight: Math.round(bounded(finite(params.videoHeight, 1080), 480, 2160)),
  },
});

export const getMotionDurationInFrames = ({fps = 30, sceneContext, pluginParams} = {}) => {
  const context = sceneContext || resolveMotionSceneContext(pluginParams);
  return Math.max(1, Math.round(context.durationSeconds * fps));
};

export const buildMotionSceneProps = ({frame = 0, fps = 30, sceneContext, pluginParams} = {}) => {
  const context = sceneContext || resolveMotionSceneContext(pluginParams);
  const durationInFrames = getMotionDurationInFrames({fps, sceneContext: context});
  const safeFrame = bounded(Math.floor(frame), 0, durationInFrames - 1);
  return {...context, frame: safeFrame, fps, durationInFrames};
};
