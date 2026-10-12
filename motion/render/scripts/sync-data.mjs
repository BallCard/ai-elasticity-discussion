import {mkdirSync, readFileSync, writeFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
const source = new URL("../../../demo/training-data.json", import.meta.url);
const destination = new URL("../motion/data/training.json", import.meta.url);
const data = JSON.parse(readFileSync(source, "utf8"));
if (data.config.steps !== 3000 || data.config.validation_points !== 401 || data.snapshots.at(-1).step !== 3000) {
  throw new Error("Update the storyboard when training configuration changes.");
}
mkdirSync(fileURLToPath(new URL("../motion/data/", import.meta.url)), {recursive: true});
writeFileSync(destination, JSON.stringify(data), "utf8");
console.log("Synced real PINN training snapshots into the animation source.");
