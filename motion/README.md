# Vibe Motion 渲染动画

本工程使用用户确认的 [vibe-motion/create-vibe-motion](https://github.com/vibe-motion/create-vibe-motion) 官方脚手架，教学场景编写在 `render/motion/`，通过其 Remotion 渲染流程输出视频。

当前成片：[pinn-elasticity-anthropic.mp4](output/pinn-elasticity-anthropic.mp4)。规格为 **1920×1080、30fps、36 秒、H.264、8 位 4:2:0、无音轨**，适合插入 PPT，由主讲同学现场讲解。按用户要求采用 Anthropic 风格的暖白纸色、炭黑文字、陶土色线条，并用用户安装的 **思源宋体 CN** 原始字体文件渲染。

此前深蓝版仍保留在 [pinn-elasticity.mp4](output/pinn-elasticity.mp4)，便于对照；项目与 PPT 入口以新版为准。

## 内容与证据

- 0–6 秒：两端固定的弹性杆，轴向荷载、材料与边界。
- 6–12 秒：几何、本构、平衡三类关系，合成并无量纲化控制方程。
- 12–18 秒：坐标进入网络，构造硬边界位移函数，求导得到残差。
- 18–29 秒：用构造的候选函数和解析残差展示逐步收敛；画面明确标注教学示意。
- 29–36 秒：401 点独立核验，展示位移、导数 / 应力与残差结果，说明适用范围。

最后核验的数字来自 [一维算例](../demo/README.md)，通过 `sync-data.mjs` 复制到动画工程；实际实验没有使用解析位移训练标签。用户已允许适当构造数据增强表达，因此训练段采用明确标注的构造函数轨迹，示意残差由该函数解析计算，不冒称实测优化日志。动画进度不表示杆的物理时间。具体视觉、字体与两类数据的区分见 [design.md](design.md)。

原有 [HTML 数值探索页](../demo/index.html)与 GIF 保留作旧原型；本次动画交付以渲染的 MP4 为准。分镜见 [storyboard.md](storyboard.md)，公式依据见 [数学准备](../docs/technical-notes.md)。

## 改动画的位置

| 源文件 | 修改内容 |
| --- | --- |
| [ElasticityScene.jsx](render/motion/ElasticityScene.jsx) | 五个场景、图形、中文文字、公式、颜色与转场时点 |
| [load-fonts.js](render/motion/load-fonts.js) | 加载用户的思源宋体 CN，等待加载完成，失败时取消渲染 |
| [config.js](render/motion/config.js) | 默认分辨率、时长和标题 |
| [elasticity-timeline.js](render/motion/elasticity-timeline.js) | 帧号到场景参数的纯函数；36 秒分镜随总时长一起缩放 |
| [render-video.mjs](render/scripts/render-video.mjs) | MP4 输出路径、H.264 编码、质量与渲染并行度 |
| [upstream.json](upstream.json) | 官方仓库提交、工具版本与来源记录 |

官方脚手架的 `remotion/` 支持层保留；原始示例 `Scene.jsx` / `timeline.js` 不再接入活动场景。实际活动合成为 `ElasticityPINN`。

## 预览和复现

已使用 Node.js **24.19.0**、pnpm **10.33.0**、Remotion **4.0.438**。依赖版本保留在 [pnpm-lock.yaml](render/pnpm-lock.yaml)，不自动追随最新 Remotion。

```powershell
cd D:\Workspace\projects\ai-elasticity-discussion\motion\render
pnpm install --frozen-lockfile --registry https://registry.npmjs.org
pnpm dev
```

`pnpm dev` 打开 Remotion Studio 的可编辑预览。渲染成片：

```powershell
pnpm run render:video
```

输出位于 `motion/output/pinn-elasticity-anthropic.mp4`。如果重新跑了 PINN 训练，该命令会先同步新核验数据再渲染；只想同步给 Studio 查看，可运行 `pnpm run sync:data` 后刷新预览。构造的教学轨迹独立于实际训练记录。

全部动作均在本地完成，不需要新增模型 API 密钥或视频生成服务。`output/`、渲染缓存及关键帧核验图由 Git 忽略；源码、锁文件和来源记录保留在项目中。上游提交是 `2657ae9abadb89714bdabf0d3aef210e60ce1223`，本机通过官方同步脚本及 CLI 生成工程。

## 本轮核验

- 动画源代码检查与合成枚举已通过，活动合成为 1080 帧、1920×1080、30fps。
- 已渲染并查看五个场景的关键帧；修正训练迭代标签与数值之间的排布。
- 新版已查看五个场景的字体、公式上下标及配色；字体原文件哈希和来源记录见 [font-manifest.json](font-manifest.json)。
- 渲染后的媒体属性、全片解码与关键帧复核结果保留在 [render-check.json](render-check.json)。

这是可继续精修的首轮教学成片，不代表算法、主案例或正式汇报内容已经由小组定案。
