import Link from "next/link";

export const metadata = {
  title: "可视化专区 — AI Learner",
};

interface VizCard {
  href: string;
  icon: string;
  title: string;
  desc: string;
  tags: string[];
  chapter: string;
}

const CARDS: VizCard[] = [
  {
    href: "/visualize/attention",
    icon: "◎",
    title: "Transformer 自注意力机制",
    desc: "悬停探索注意力热图，切换多头视角，直观感受 Q/K/V 如何捕捉语言中的依存关系",
    tags: ["Q/K/V 矩阵", "多头注意力", "注意力热图"],
    chapter: "第 3 章",
  },
  {
    href: "/visualize/positional-encoding",
    icon: "≋",
    title: "位置编码热图",
    desc: "点击热图格子查看 sin/cos 位置编码数值，切换曲线模式观察不同频率维度如何随位置变化",
    tags: ["正弦编码", "频率分析", "RoPE 对比"],
    chapter: "第 3 章",
  },
  {
    href: "/visualize/backprop",
    icon: "⟳",
    title: "反向传播梯度流动",
    desc: "逐步演示前向传播、损失计算、链式法则求导到权重更新的完整过程，悬停查看每个连接的梯度数值",
    tags: ["梯度下降", "链式法则", "权重更新"],
    chapter: "第 2 章",
  },
  {
    href: "/visualize/optimizer",
    icon: "◈",
    title: "梯度下降优化器对比",
    desc: "在 2D 损失曲面上同时展示 SGD、Momentum、RMSProp、Adam 的收敛轨迹，动态演示各优化器收敛速度差异",
    tags: ["SGD", "Adam", "收敛轨迹"],
    chapter: "第 2 章",
  },
  {
    href: "/visualize/activation",
    icon: "ƒ",
    title: "激活函数与梯度消失",
    desc: "对比 Sigmoid、Tanh、ReLU、Leaky ReLU、GELU 函数曲线及其导数，开启导数模式直观理解梯度消失问题",
    tags: ["ReLU", "GELU", "梯度消失"],
    chapter: "第 2 章",
  },
  {
    href: "/visualize/sampling",
    icon: "🎲",
    title: "LLM 采样策略",
    desc: "实时调整 Temperature / Top-K / Top-P，观察候选词概率分布变化，点击采样按钮模拟真实生成过程",
    tags: ["Temperature", "Top-P", "核采样"],
    chapter: "第 8 章",
  },
  {
    href: "/visualize/transformer-flow",
    icon: "↕",
    title: "Transformer 完整数据流",
    desc: "逐层点击展示 Token 从 Embedding 到输出 Logits 的完整前向传播，查看每层公式、维度变化与作用",
    tags: ["前向传播", "残差连接", "维度变化"],
    chapter: "第 3 章",
  },
  {
    href: "/visualize/word-embedding",
    icon: "✦",
    title: "词向量语义空间",
    desc: "2D 语义聚类散点图，悬停查看近邻词，一键演示 king−man+woman=queen 向量类比运算",
    tags: ["Word2Vec", "语义类比", "向量空间"],
    chapter: "第 4 章",
  },
  {
    href: "/visualize/tokenizer",
    icon: "⌁",
    title: "BPE 分词过程",
    desc: "逐步演示 Byte Pair Encoding 字符对合并操作，观察子词词表是如何从字符级一步步构建出来的",
    tags: ["BPE", "子词切分", "OOV 处理"],
    chapter: "第 4 章",
  },
  {
    href: "/visualize/lora",
    icon: "⊗",
    title: "LoRA 低秩矩阵分解",
    desc: "拖动秩 r 滑块，对比全参微调与 LoRA 的参数量差异，热图可视化 W₀、A、B 矩阵及合并后的权重",
    tags: ["低秩分解", "参数高效", "QLoRA"],
    chapter: "第 6 章",
  },
  {
    href: "/visualize/rlhf",
    icon: "⚖",
    title: "RLHF 三阶段流程",
    desc: "逐步演示 SFT → 奖励模型训练 → PPO 对齐三个阶段，揭示 ChatGPT 式模型「被训练出来」的完整过程",
    tags: ["SFT", "奖励模型", "PPO"],
    chapter: "第 7 章",
  },
  {
    href: "/visualize/kv-cache",
    icon: "▣",
    title: "KV Cache 推理加速",
    desc: "动画对比有无 KV Cache 时自回归生成的计算量差异，直观理解为何 Cache 能将推理从 O(n²) 降至 O(n)",
    tags: ["KV Cache", "推理加速", "显存管理"],
    chapter: "第 8 章",
  },
  {
    href: "/visualize/quantization",
    icon: "▦",
    title: "模型量化精度对比",
    desc: "切换 FP32/INT8/INT4 等格式，对比权重直方图、量化误差与 7B/70B 模型显存占用的实时变化",
    tags: ["INT4/INT8", "量化误差", "显存压缩"],
    chapter: "第 8 章",
  },
  {
    href: "/visualize/moe",
    icon: "⑃",
    title: "MoE 混合专家路由",
    desc: "选择不同 Token 观察路由器如何动态分配 Top-2 专家，对比稀疏激活与 Dense 模型的参数效率差异",
    tags: ["稀疏激活", "专家路由", "Mixtral"],
    chapter: "第 10 章",
  },
  {
    href: "/visualize/rag",
    icon: "⊞",
    title: "RAG 检索增强全流程",
    desc: "可视化向量空间中的语义检索，逐步演示 Embedding → 相似度检索 → 上下文增强 → LLM 生成的完整 RAG 链路",
    tags: ["向量检索", "文档召回", "增强生成"],
    chapter: "第 9 章",
  },
];

export default function VisualizePage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-background)" }}>
      <nav className="border-b px-6 py-3 flex items-center gap-2 text-sm" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)", color: "var(--color-text-muted)" }}>
        <Link href="/" className="hover:text-white transition-colors">AI Learner</Link>
        <span>/</span>
        <span style={{ color: "var(--color-text)" }}>可视化专区</span>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--color-text)" }}>可视化专区</h1>
        <p className="text-sm mb-10" style={{ color: "var(--color-text-muted)" }}>
          核心 AI 概念的交互式动画，帮你真正理解抽象原理 · 共 {CARDS.length} 个可视化
        </p>

        <div className="grid gap-4">
          {CARDS.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="p-6 rounded-xl border transition-all hover:border-purple-500/50 hover:bg-white/[0.02] group"
              style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
            >
              <div className="flex items-start gap-4">
                <div className="text-2xl shrink-0" style={{ color: "var(--color-accent)" }}>{card.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="font-semibold" style={{ color: "var(--color-text)" }}>{card.title}</h2>
                    <span
                      className="text-xs px-2 py-0.5 rounded shrink-0"
                      style={{ backgroundColor: "rgba(86,212,179,0.1)", color: "var(--color-accent-2)" }}
                    >
                      {card.chapter}
                    </span>
                  </div>
                  <p className="text-sm mb-3" style={{ color: "var(--color-text-muted)" }}>
                    {card.desc}
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {card.tags.map((tag) => (
                      <span key={tag} className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: "rgba(124,109,250,0.12)", color: "var(--color-accent)" }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <span className="ml-auto text-sm opacity-0 group-hover:opacity-100 transition-opacity shrink-0" style={{ color: "var(--color-accent)" }}>
                  进入 →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
