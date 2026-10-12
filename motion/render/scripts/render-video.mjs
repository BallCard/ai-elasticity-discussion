import "./sync-data.mjs";
import {mkdirSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {ensureSharedBrowserExecutable, runLocalRemotionCli} from "./remotion-browser-executable.mjs";
import {ACTIVE_COMPOSITION_ID} from "../motion/composition-id.js";
const output = fileURLToPath(new URL("../../output/pinn-elasticity-anthropic.mp4", import.meta.url));
mkdirSync(fileURLToPath(new URL("../../output/", import.meta.url)), {recursive: true});
const browser = await ensureSharedBrowserExecutable();
const args = ["render", ACTIVE_COMPOSITION_ID, output, "--codec", "h264", "--pixel-format", "yuv420p",
  "--crf", "18", "--concurrency", "4", "--muted", "--log", "error"];
if (browser) args.push("--browser-executable", browser);
console.log(`Rendering 1920x1080 / 30 fps / 36 seconds -> ${output}`);
const result = runLocalRemotionCli({args, stdio: "inherit"});
if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status || 1);
console.log(`Rendered ${output}`);
