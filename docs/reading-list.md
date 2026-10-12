# 文献入口与阅读路线

核对日期：2026-10-12。这是首轮教学准备的精选入口，不是截至该日的完整系统综述，也不声称这些是最新方法。技术判断优先依据作者教材、原始论文和官方文档。

## 先读哪几项

首次组会前：R1 对齐力学基线 → R2 理解 PINN 对象 → R3 看真正的固体力学设定 → R5 准备反方。R4、R6、R7 只用于方法比较或备用讨论。R8 / R9 供动画表达参考。

| 编号 | 原始来源 | 能支持的内容与阅读任务 | 本轮实际核对程度 |
| --- | --- | --- | --- |
| R1 | A. F. Bower，[*Applied Mechanics of Solids*, §3.2 Linear Elastic Materials](https://solidmechanics.org/Text/Chapter3_2/Chapter3_2.php) | 线弹性、本构与适用假设。结合现有课程笔记核对 E、ν 与 Lamé 记号；勿把线性范围推广至所有弹性 | 作者教材页面可访问；同时查阅本机课程基线 |
| R2 | M. Raissi, P. Perdikaris, G. E. Karniadakis，[2017 预印本 Part I](https://arxiv.org/abs/1711.10561)；2019 JCP 论文 [DOI](https://doi.org/10.1016/j.jcp.2018.10.045) | 网络解函数与方程约束；区分正问题与反问题。用本项目推导示例讲机制，不照搬 PDE 算例 | 预印本摘要与发表信息已核对，未宣称复现全文实验 |
| R3 | E. Haghighat 等，[*A deep learning framework for solution and discovery in solid mechanics*](https://arxiv.org/html/2003.02751v2)，2020 v2 | 优先看 §2、§3.2–3.3、§3.7。文中用合成场数据、多个网络及平衡 / 本构约束进行学习与识别；压力测试不同材料参数。本文与本项目纯方程演示的训练信息不同 | 已查正文架构、损失式(8)–(9)、数据设定与敏感性分析段落；未重跑原代码 |
| R4 | E. Samaniego 等，[*An energy approach to the solution of partial differential equations in computational mechanics via machine learning*](https://www.sciencedirect.com/science/article/abs/pii/S0045782519306826)，CMAME 362 (2020), 112790，[DOI](https://doi.org/10.1016/j.cma.2019.112790) | 能量目标构造与网络近似空间，用于比较强形式残差和能量方法。摘要列举线弹性与超弹性等应用；不能据此断言对所有问题收敛更好 | 检索取得出版社摘要与元数据；直接打开全文页面失败，未核对全文数值结论 |
| R5 | S. Wang, Y. Teng, P. Perdikaris，[*Understanding and mitigating gradient pathologies in physics-informed neural networks*](https://arxiv.org/abs/2001.04536)，2020 预印本；2021 SIAM JSC [DOI](https://doi.org/10.1137/20M1318043) | 多项损失的梯度失衡及训练困难。给组员的问题：满足方程的目标为何仍可能训不好？ | 核对摘要及发表信息；不引用摘要中的性能倍率作为本课力学收益 |
| R6 | Z. Li 等，[*Fourier Neural Operator for Parametric Partial Differential Equations*](https://arxiv.org/abs/2010.08895)，2020 / ICLR 2021 | 从一组参数场学到解场。原文实验是 Burgers、Darcy 和 Navier–Stokes，**不能直接当成弹性力学性能证据** | 核对作者摘要、实验对象与版本；不转引加速倍率 |
| R7 | L. Lu, P. Jin, G. E. Karniadakis，[DeepONet 预印本](https://arxiv.org/abs/1910.03193)，2019 / 2020；2021 扩展发表版本 [Nature Machine Intelligence](https://doi.org/10.1038/s42256-021-00302-5) | 输入函数与查询位置分开编码，再生成响应。注意通用逼近定理并不涵盖实际优化和泛化保证；预印本与发表版作者 / 标题不完全相同 | 核对预印本摘要及出版社简介，不混写两版本元数据 |
| R8 | Grant Sanderson / 3Blue1Brown，[But what is a Neural Network?](https://www.3blue1brown.com/lessons/neural-networks/) | 学习从输入、可调参数到输出的逐步可视讲述；参考“概念随对象变化出现”的结构。不是 PINN 或弹性求解证据 | 作者教程入口已核对；不复制其素材、画面或配音 |
| R9 | [Manim Community](https://www.manim.community/) 与 [官方文档](https://docs.manim.community/en/stable/) | 若最终需要更精细的公式转场，可用场景组织与动画教程。当前原型不依赖 Manim，避免先投入复杂环境配置 | 官方网站已核对，文档为后续制作入口；当前未安装或使用 |

## 一个值得深入的论文例子

R3 与本课程最贴近：空间坐标作为输入，位移与应力作为多个网络输出，几何关系通过位移求导，本构和平衡进入损失；材料参数可固定或参与识别。它依靠解析 / 数值参考生成合成数据，不是现实工程部署的验证。

本轮可向组员提两个问题：为什么学习应力与位移两个对象？为什么由位移推得的应力可能比位移本身误差更明显？更多结构和性能比较留给组员核对原文后决定是否进正文。

## 文献证据的使用规则

1. 原文支持“在何种条件下完成何种任务”，不能改写为“AI 已全面超过传统方法”。
2. 图片进入最终 PPT 前记录图号、载荷、边界、单位、训练数据与来源；重绘必须注明根据原文整理。
3. 对比速度前交代精度、硬件、数据生成、训练、调参及测试成本。本文没有建立统一性能基准。
4. 发表结果、自行推导、本项目实验与设想分别标识。
5. 原型的一维杆不是 R3 的二维论文复现；没有完成的实验不填写成功率或准确率。

本机课程材料在另一个项目的 `course-notes-lab/courses/弹性力学（A）` 中，用于核对符号与受众基线。课程材料保持原位，不包含在这个公开仓库中。
