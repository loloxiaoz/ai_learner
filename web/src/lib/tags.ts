export interface KnowledgeTag {
  name: string;
  chapter: string; // slug
  weight: 1 | 2 | 3; // 重要性，决定基础字号
}

export const KNOWLEDGE_TAGS: KnowledgeTag[] = [
  // 第 01 章：AI 基础
  { name: "图灵测试", chapter: "01", weight: 2 },
  { name: "机器学习", chapter: "01", weight: 3 },
  { name: "深度学习", chapter: "01", weight: 3 },
  { name: "神经网络", chapter: "01", weight: 3 },
  { name: "符号主义", chapter: "01", weight: 1 },
  { name: "连接主义", chapter: "01", weight: 2 },
  { name: "感知机", chapter: "01", weight: 1 },

  // 第 02 章：深度学习核心
  { name: "反向传播", chapter: "02", weight: 3 },
  { name: "梯度下降", chapter: "02", weight: 3 },
  { name: "激活函数", chapter: "02", weight: 2 },
  { name: "批归一化", chapter: "02", weight: 2 },
  { name: "Dropout", chapter: "02", weight: 2 },
  { name: "卷积神经网络", chapter: "02", weight: 3 },
  { name: "循环神经网络", chapter: "02", weight: 2 },
  { name: "过拟合", chapter: "02", weight: 2 },
  { name: "学习率", chapter: "02", weight: 2 },

  // 第 03 章：Transformer
  { name: "Transformer", chapter: "03", weight: 3 },
  { name: "自注意力机制", chapter: "03", weight: 3 },
  { name: "多头注意力", chapter: "03", weight: 3 },
  { name: "位置编码", chapter: "03", weight: 2 },
  { name: "Layer Norm", chapter: "03", weight: 2 },
  { name: "前馈网络", chapter: "03", weight: 1 },
  { name: "Q/K/V矩阵", chapter: "03", weight: 2 },
  { name: "注意力分数", chapter: "03", weight: 2 },

  // 第 04 章：LLM 架构
  { name: "GPT", chapter: "04", weight: 3 },
  { name: "BERT", chapter: "04", weight: 3 },
  { name: "LLaMA", chapter: "04", weight: 2 },
  { name: "MoE", chapter: "04", weight: 2 },
  { name: "涌现能力", chapter: "04", weight: 3 },
  { name: "Scaling Law", chapter: "04", weight: 3 },
  { name: "RoPE", chapter: "04", weight: 2 },
  { name: "GQA", chapter: "04", weight: 1 },

  // 第 05 章：大模型训练
  { name: "预训练", chapter: "05", weight: 3 },
  { name: "分布式训练", chapter: "05", weight: 3 },
  { name: "混合精度", chapter: "05", weight: 2 },
  { name: "梯度检查点", chapter: "05", weight: 2 },
  { name: "数据并行", chapter: "05", weight: 2 },
  { name: "模型并行", chapter: "05", weight: 2 },
  { name: "FSDP", chapter: "05", weight: 2 },
  { name: "ZeRO", chapter: "05", weight: 2 },

  // 第 06 章：微调
  { name: "LoRA", chapter: "06", weight: 3 },
  { name: "QLoRA", chapter: "06", weight: 3 },
  { name: "Prompt Tuning", chapter: "06", weight: 2 },
  { name: "指令微调", chapter: "06", weight: 3 },
  { name: "PEFT", chapter: "06", weight: 2 },
  { name: "全量微调", chapter: "06", weight: 1 },
  { name: "Adapter", chapter: "06", weight: 1 },

  // 第 07 章：RLHF
  { name: "RLHF", chapter: "07", weight: 3 },
  { name: "PPO", chapter: "07", weight: 3 },
  { name: "DPO", chapter: "07", weight: 3 },
  { name: "奖励模型", chapter: "07", weight: 3 },
  { name: "对齐", chapter: "07", weight: 3 },
  { name: "Constitutional AI", chapter: "07", weight: 2 },
  { name: "人类反馈", chapter: "07", weight: 2 },

  // 第 08 章：推理优化
  { name: "量化", chapter: "08", weight: 3 },
  { name: "KV Cache", chapter: "08", weight: 3 },
  { name: "投机采样", chapter: "08", weight: 2 },
  { name: "vLLM", chapter: "08", weight: 3 },
  { name: "PagedAttention", chapter: "08", weight: 2 },
  { name: "FlashAttention", chapter: "08", weight: 3 },
  { name: "INT8量化", chapter: "08", weight: 2 },

  // 第 09 章：RAG & Agent
  { name: "RAG", chapter: "09", weight: 3 },
  { name: "向量数据库", chapter: "09", weight: 3 },
  { name: "Agent", chapter: "09", weight: 3 },
  { name: "工具调用", chapter: "09", weight: 2 },
  { name: "ReAct", chapter: "09", weight: 2 },
  { name: "检索增强", chapter: "09", weight: 3 },
  { name: "Embedding", chapter: "09", weight: 2 },

  // 第 10 章：前沿趋势
  { name: "多模态", chapter: "10", weight: 3 },
  { name: "具身智能", chapter: "10", weight: 2 },
  { name: "AI安全", chapter: "10", weight: 3 },
  { name: "世界模型", chapter: "10", weight: 2 },
  { name: "推理模型", chapter: "10", weight: 3 },
  { name: "长上下文", chapter: "10", weight: 2 },
];
