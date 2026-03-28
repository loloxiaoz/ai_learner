# AI与大模型系统学习路径

[![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC%20BY--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-sa/4.0/)

> 面向面试准备与技术晋升答辩的系统性学习计划（10章）

## 学习者背景
- 已有大模型开发经验
- 目标：面试准备 + 技术晋升答辩
- 学习方式：理论 + 实践结合
- 计划时间：1-2个月

---

## 目录

| 章节 | 主题 | 正文 | 学习检验 |
|-----|------|------|---------|
| 第一章 | AI基础与发展脉络 | [正文](01_AI基础与发展脉络/01_正文.md) | [检验](01_AI基础与发展脉络/02_学习检验.md) |
| 第二章 | 深度学习核心原理 | [正文](02_深度学习核心原理/01_正文.md) | [检验](02_深度学习核心原理/02_学习检验.md) |
| 第三章 | Transformer架构深度解析 | [正文](03_Transformer架构深度解析/01_正文.md) | [检验](03_Transformer架构深度解析/02_学习检验.md) |
| 第四章 | 大语言模型架构演进 | [正文](04_大语言模型架构演进/01_正文.md) | [检验](04_大语言模型架构演进/02_学习检验.md) |
| 第五章 | 大模型训练技术 | [正文](05_大模型训练技术/01_正文.md) | [检验](05_大模型训练技术/02_学习检验.md) |
| 第六章 | 大模型微调技术 | [正文](06_大模型微调技术/01_正文.md) | [检验](06_大模型微调技术/02_学习检验.md) |
| 第七章 | RLHF与对齐技术 | [正文](07_RLHF与对齐技术/01_正文.md) | [检验](07_RLHF与对齐技术/02_学习检验.md) |
| 第八章 | 推理优化与部署 | [正文](08_推理优化与部署/01_正文.md) | [检验](08_推理优化与部署/02_学习检验.md) |
| 第九章 | RAG与Agent应用 | [正文](09_RAG与Agent应用/01_正文.md) | [检验](09_RAG与Agent应用/02_学习检验.md) |
| 第十章 | 前沿趋势与实战总结 | [正文](10_前沿趋势与实战总结/01_正文.md) | [检验](10_前沿趋势与实战总结/02_学习检验.md) |

---

## 第一章：AI基础与发展脉络

### 学习目标
- 理解人工智能发展历史与三次浪潮
- 掌握机器学习、深度学习、大模型的关系
- 了解主流AI范式演进：符号主义→连接主义→Transformer

### 核心知识点
- [ ] AI发展历史与里程碑事件
- [ ] 三大学派：符号主义、连接主义、行为主义
- [ ] 机器学习基本概念与分类
- [ ] 深度学习崛起的关键因素
- [ ] 大模型时代的技术突破

### 面试/答辩要点
- 能清晰阐述技术发展脉络和关键里程碑
- 能解释为什么深度学习在2012年后爆发
- 能说明大模型相比传统方法的本质区别

### 学习状态
- [ ] 未开始

---

## 第二章：深度学习核心原理

### 学习目标
- 掌握神经网络基础：前向传播、反向传播、梯度下降
- 理解常见网络架构：CNN、RNN、LSTM
- 熟悉优化器原理：SGD、Adam、AdamW
- 了解正则化与过拟合处理

### 核心知识点
- [ ] 感知机与多层感知机
- [ ] 激活函数：Sigmoid、ReLU、GELU
- [ ] 反向传播算法推导
- [ ] 梯度消失与梯度爆炸
- [ ] CNN卷积原理与经典网络
- [ ] RNN/LSTM/GRU序列建模
- [ ] 优化器对比与选择
- [ ] Dropout、L1/L2正则化

### 面试/答辩要点
- 能推导反向传播核心公式
- 能解释梯度消失问题及解决方案
- 能对比不同优化器的优缺点

### 学习状态
- [ ] 未开始

---

## 第三章：Transformer架构深度解析

### 学习目标
- 深入理解Self-Attention机制原理与计算
- 掌握Multi-Head Attention设计思想
- 了解Position Encoding方案对比
- 理解Layer Normalization vs Batch Normalization

### 核心知识点
- [ ] Attention机制的起源与演进
- [ ] Self-Attention计算过程（Q、K、V）
- [ ] Scaled Dot-Product Attention
- [ ] Multi-Head Attention原理
- [ ] 位置编码：正弦编码、可学习编码、RoPE
- [ ] Encoder-Decoder架构
- [ ] Pre-Norm vs Post-Norm

### 面试/答辩要点
- 能手推Attention公式
- 能分析Transformer的时间和空间复杂度
- 能解释为什么需要缩放因子sqrt(d_k)

### 学习状态
- [ ] 未开始

---

## 第四章：大语言模型架构演进

### 学习目标
- 了解GPT系列：GPT-1/2/3/4架构演进
- 理解BERT与双向编码器
- 熟悉LLaMA、Mistral等开源模型架构
- 掌握MoE（混合专家）架构原理

### 核心知识点
- [ ] GPT系列架构演进与关键创新
- [ ] BERT预训练任务设计
- [ ] Encoder-only vs Decoder-only vs Encoder-Decoder
- [ ] LLaMA架构特点（RMSNorm、SwiGLU、RoPE）
- [ ] Mistral滑动窗口注意力
- [ ] MoE稀疏激活原理
- [ ] 模型规模与涌现能力

### 面试/答辩要点
- 能对比GPT和BERT的设计理念差异
- 能解释LLaMA相比GPT的改进点
- 能说明MoE的优势和挑战

### 学习状态
- [ ] 未开始

---

## 第五章：大模型训练技术

### 学习目标
- 理解预训练目标：MLM、CLM、Span Corruption
- 掌握分布式训练：数据并行、模型并行、流水线并行
- 了解混合精度训练与梯度累积
- 熟悉DeepSpeed、Megatron-LM框架

### 核心知识点
- [ ] 语言模型预训练目标对比
- [ ] 数据并行（DP、DDP、FSDP）
- [ ] 张量并行与流水线并行
- [ ] 3D并行策略
- [ ] 混合精度训练（FP16/BF16）
- [ ] 梯度检查点与梯度累积
- [ ] ZeRO优化技术
- [ ] 训练稳定性与Loss Spike处理

### 面试/答辩要点
- 能设计千亿参数模型的训练方案
- 能解释ZeRO-1/2/3的区别
- 能分析训练中常见问题及解决方案

### 学习状态
- [ ] 未开始

---

## 第六章：大模型微调技术

### 学习目标
- 对比Full Fine-tuning与Parameter-Efficient Fine-tuning
- 深入理解LoRA/QLoRA原理与实践
- 了解Prefix Tuning、P-Tuning、Adapter
- 掌握指令微调（Instruction Tuning）

### 核心知识点
- [ ] 全参数微调的优缺点
- [ ] LoRA原理：低秩分解
- [ ] QLoRA：量化+LoRA
- [ ] Adapter Layer设计
- [ ] Prefix Tuning与Prompt Tuning
- [ ] P-Tuning v1/v2
- [ ] 指令微调数据构造
- [ ] 多任务微调策略

### 面试/答辩要点
- 能根据场景选择合适的微调方案
- 能解释LoRA为什么有效
- 能设计指令微调的数据方案

### 学习状态
- [ ] 未开始

---

## 第七章：RLHF与对齐技术

### 学习目标
- 理解人类反馈强化学习（RLHF）流程
- 掌握Reward Model训练方法
- 了解PPO算法在LLM中的应用
- 熟悉DPO、ORPO等新型对齐方法

### 核心知识点
- [ ] 为什么需要对齐（Alignment）
- [ ] RLHF三阶段流程
- [ ] Reward Model设计与训练
- [ ] PPO算法原理
- [ ] KL散度约束的作用
- [ ] DPO：直接偏好优化
- [ ] ORPO、IPO等新方法
- [ ] Constitutional AI思想

### 面试/答辩要点
- 能解释RLHF的完整流程
- 能对比RLHF和DPO的优缺点
- 能说明对齐技术的必要性

### 学习状态
- [ ] 未开始

---

## 第八章：推理优化与部署

### 学习目标
- 掌握模型量化：INT8/INT4/GPTQ/AWQ
- 理解KV Cache优化原理
- 了解Flash Attention原理
- 熟悉推理框架：vLLM、TensorRT-LLM、Ollama

### 核心知识点
- [ ] 量化基础：对称/非对称量化
- [ ] Post-Training Quantization
- [ ] GPTQ、AWQ、GGUF格式
- [ ] KV Cache原理与优化
- [ ] PagedAttention技术
- [ ] Flash Attention原理
- [ ] 投机采样（Speculative Decoding）
- [ ] 批处理优化：Continuous Batching

### 面试/答辩要点
- 能设计高性能推理部署方案
- 能解释不同量化方法的精度损失
- 能分析推理延迟的瓶颈

### 学习状态
- [ ] 未开始

---

## 第九章：RAG与Agent应用

### 学习目标
- 掌握RAG架构与检索增强生成
- 了解向量数据库选型与Embedding模型
- 熟悉Agent框架：ReAct、LangChain
- 理解Function Calling与工具调用

### 核心知识点
- [ ] RAG基本架构
- [ ] 文档切分策略
- [ ] Embedding模型选择
- [ ] 向量数据库对比（Milvus、Pinecone、Chroma）
- [ ] 检索优化：混合检索、重排序
- [ ] Agent设计模式
- [ ] ReAct框架原理
- [ ] Function Calling实现
- [ ] 多Agent协作

### 面试/答辩要点
- 能设计完整的RAG应用方案
- 能解释RAG vs 长上下文的取舍
- 能设计Agent的工具调用流程

### 学习状态
- [ ] 未开始

---

## 第十章：前沿趋势与实战总结

### 学习目标
- 了解多模态大模型：GPT-4V、Gemini、LLaVA
- 掌握长上下文处理技术
- 熟悉小模型蒸馏与端侧部署
- 汇总面试常见问题与答辩技巧

### 核心知识点
- [ ] 多模态架构设计
- [ ] 视觉编码器与LLM融合
- [ ] 长上下文：ALiBi、YaRN、Ring Attention
- [ ] 知识蒸馏技术
- [ ] 端侧部署优化
- [ ] 面试高频问题汇总
- [ ] 答辩材料准备技巧
- [ ] 技术亮点包装方法

### 面试/答辩要点
- 展示技术视野和前沿认知
- 能结合实际项目说明技术选型
- 清晰表达技术深度和业务价值

### 学习状态
- [ ] 未开始

---

## 学习进度安排

| 阶段 | 时间 | 章节 | 重点 |
|------|------|------|------|
| 第一阶段 | 第1-2周 | 1-3章 | 夯实基础，重点攻克Transformer |
| 第二阶段 | 第3-4周 | 4-6章 | 理解模型架构与训练微调 |
| 第三阶段 | 第5-6周 | 7-9章 | 掌握对齐、推理、应用 |
| 第四阶段 | 第7-8周 | 第10章+复习 | 前沿趋势+模拟面试/答辩 |

---

## 学习资源推荐

### 经典论文
- Attention Is All You Need (Transformer)
- BERT: Pre-training of Deep Bidirectional Transformers
- Language Models are Few-Shot Learners (GPT-3)
- LLaMA: Open and Efficient Foundation Language Models
- Training language models to follow instructions with human feedback (InstructGPT)

### 推荐课程
- Stanford CS224N: NLP with Deep Learning
- Stanford CS229: Machine Learning
- Andrej Karpathy: Neural Networks Zero to Hero

### 实践项目
- 从零实现Transformer
- 使用LoRA微调开源模型
- 构建RAG应用
- 部署量化模型

---

## License

本项目采用 [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) 许可证。

你可以自由地：
- **分享** — 以任何媒介或格式复制、转载本作品
- **改编** — 修改、转换或基于本作品创作

但需要遵守：
- **署名** — 你必须注明出处并提供许可证链接
- **相同方式共享** — 如果你修改或基于本作品创作，必须以相同许可证发布
