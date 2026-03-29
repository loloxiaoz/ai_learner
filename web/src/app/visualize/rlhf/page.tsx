import Link from "next/link";
import RLHFVisualizer from "@/components/RLHFVisualizer";

export const metadata = {
  title: "RLHF 三阶段流程可视化 — AI Learner",
  description: "交互式探索 RLHF 三个阶段：监督微调（SFT）、奖励模型训练（RM）、PPO 强化学习对齐",
};

export default function RLHFPage() {
  return (
    <div className="min-h-screen viz-page" style={{ backgroundColor: "var(--color-background)" }}>
      <nav
        className="sticky top-0 z-10 border-b px-6 py-3 flex items-center justify-between"
        style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
      >
        <div className="flex items-center gap-2 text-sm" style={{ color: "var(--color-text-muted)" }}>
          <Link href="/" className="hover:text-white transition-colors">AI Learner</Link>
          <span>/</span>
          <Link href="/visualize" className="hover:text-white transition-colors">可视化专区</Link>
          <span>/</span>
          <span style={{ color: "var(--color-text)" }}>RLHF 三阶段流程</span>
        </div>
        <Link
          href="/learn/07"
          className="text-xs px-3 py-1.5 rounded-lg border transition-all hover:bg-white/5"
          style={{ borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}
        >
          → 第 7 章正文
        </Link>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-10">
          <div
            className="inline-flex items-center gap-2 text-xs font-mono px-3 py-1 rounded-full mb-4 border"
            style={{ borderColor: "var(--color-accent-2)", color: "var(--color-accent-2)", backgroundColor: "rgba(86, 212, 179, 0.08)" }}
          >
            ⚖ 交互式可视化
          </div>
          <h1 className="text-3xl font-bold mb-3" style={{ color: "var(--color-text)" }}>
            RLHF 三阶段流程
          </h1>
          <p style={{ color: "var(--color-text-muted)" }} className="text-sm leading-relaxed">
            ChatGPT 之所以「懂得」如何回答，核心在于
            <strong style={{ color: "var(--color-text)" }}>基于人类反馈的强化学习（RLHF）</strong>。
            三个阶段相互依赖：SFT 建立对话能力 → RM 量化人类偏好 → PPO 用奖励信号持续优化模型行为。
            点击各阶段，逐步理解 ChatGPT 是如何「被训练出来」的。
          </p>
        </div>

        <RLHFVisualizer />

        <div
          className="mt-10 p-5 rounded-xl border"
          style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
        >
          <h3 className="font-medium mb-3 text-sm" style={{ color: "var(--color-text)" }}>延伸学习</h3>
          <div className="space-y-2 text-sm" style={{ color: "var(--color-text-muted)" }}>
            <p>→ 阅读第 7 章《RLHF 与对齐技术》，了解宪法 AI（Constitutional AI）和 AI 安全的更深层原理</p>
            <p>→ <strong style={{ color: "var(--color-text)" }}>DPO（直接偏好优化）：</strong>斯坦福提出，绕过显式 RM，直接用偏好数据通过分类损失优化策略，实现简单稳定</p>
            <p>→ <strong style={{ color: "var(--color-text)" }}>奖励黑客（Reward Hacking）：</strong>模型会「钻空子」最大化 RM 分数而非真正变好，KL 惩罚和定期重置参考策略是主要缓解手段</p>
          </div>
        </div>
      </div>
    </div>
  );
}
