# AI 与弹性力学问题的求解 · 讨论课准备

围绕老师给定主题组织小组讨论，最后完成 **10 分钟汇报 + 约 3 分钟讨论**。老师原通知初定 **2026 年 10 月 27 日**，建议 PPT 约 20 页；年份结合本次会话日期理解，日期仍保留“初定”状态。

当前是 **2026-10-12 首轮准备稿**：已整理对话要求、形成研究主线、分工与讨论方案、文献入口和 20 页 PPT 提纲。动画使用 **vibe-motion/create-vibe-motion** 渲染 MP4，按用户要求采用 **Anthropic 风格与用户的思源宋体 CN**；过程曲线可构造并明确标注，最后的核验数字沿用真实 PINN 实验。算法和案例尚未经过小组讨论定案；尚无正式 PPTX。

公开仓库：[BallCard/ai-elasticity-discussion](https://github.com/BallCard/ai-elasticity-discussion)。仓库包含准备文档、可编辑动画工程、字体及两版 MP4，默认入口为 Anthropic 风格成片。

## 先看什么

| 材料 | 用途 |
| --- | --- |
| [关键背景与范围](docs/context.md) | 老师要求、组长的逻辑链、已知信息与待核对项 |
| [小组讨论与分工包](docs/discussion-kit.md) | 可直接用于第一次组会；研究任务、头脑风暴、反方检验、汇总模板 |
| [数学与方法准备](docs/technical-notes.md) | 三类方程、AI 介入位置、PINN 算例推导、二维迁移、可信性讨论 |
| [文献与阅读路线](docs/reading-list.md) | 原始论文与作者教程；各自能支持什么，哪里不能外推 |
| [PPT 逐页提纲](slides/outline.md) | 18 页正文合计 600 秒，2 页备份；核心句、图示、讲述与来源 |
| [渲染动画工程](motion/README.md) | Vibe Motion / Remotion 可编辑源码、分镜、预览与 MP4 复现 |
| [教学动画 MP4](motion/output/pinn-elasticity-anthropic.mp4) | 36 秒、1080p、30fps：Anthropic 风格、思源宋体 CN；建模、训练示意与真实核验 |
| [数值算例说明](demo/README.md) | 原始训练、验证、复现与数值依据 |
| [旧数值探索原型](demo/index.html) | HTML 交互页，仅供查看数值，不是本次指定的动画成品 |

建议主线：**学科背景 → 物理问题与假设 → 求解流程 → AI 改变的步骤 → 一个 PINN 模型 → 验证与适用条件 → 工程取舍与开放问题**。

建议中心结论：AI 在这里提供新的函数近似与优化方式；是否值得采用，要由具体任务、独立误差、总成本和失败后果判断。对本教学算例，解析解与传统离散解更直接；PINN 的价值是把“网络怎样受到物理约束”讲清楚。

## 项目边界

- `docs/` 是准备材料，`slides/outline.md` 是内容源稿，`demo/` 保存数值算例与旧原型，`motion/` 保存渲染动画工程和成片；均不自动等于正式汇报版本。
- 对话中的“PNPRNN”尚不能认定具体算法。当前选择 **PINN（Physics-Informed Neural Network）** 是准备建议。
- 已引用现有课程笔记作为符号与受众基线。本机的 `course-notes-lab/courses/弹性力学（A）` 是另一个项目，教材和课件不包含在本仓库。
- 本目录使用独立 Git 仓库；按用户 2026-10-12 的明确要求创建公开远端并推送。原始对话检索快照存于本机 `.local/conversation.json`，由 Git 忽略。

## 接下来由小组定案的内容

1. 确定成员、分工及上台同学；核对通知是否有更新。
2. 阅读主线论文，比较 PINN 与代理模型是否更贴合本组的兴趣；确定最终主案例。
3. 核对推导与论文图表的具体条件，补齐工程证据，再依提纲制作 PPTX。
4. 限时彩排，压缩到 10 分钟；保留一个真正能在 3 分钟内讨论的问题。

MP4 可直接播放或插入 PPT；编辑 / 重新渲染使用 [motion/README.md](motion/README.md) 中的 Vibe Motion 工程。数值训练复现需要 Python、PyTorch、NumPy、Matplotlib，见 [demo/README.md](demo/README.md)。
