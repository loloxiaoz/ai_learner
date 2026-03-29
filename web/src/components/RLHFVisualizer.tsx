"use client";

import { useState } from "react";

// ─── 数据定义 ──────────────────────────────────────────────────────────────────
type Phase = "sft" | "rm" | "ppo";

interface PhaseInfo {
  id: Phase;
  step: string;
  title: string;
  subtitle: string;
  color: string;
}

const PHASES: PhaseInfo[] = [
  { id: "sft", step: "阶段 1", title: "监督微调（SFT）", subtitle: "让模型学会「对话格式」", color: "#60a5fa" },
  { id: "rm", step: "阶段 2", title: "奖励模型训练（Reward Model）", subtitle: "量化人类偏好", color: "#fbbf24" },
  { id: "ppo", step: "阶段 3", title: "PPO 强化学习对齐", subtitle: "用奖励信号优化策略", color: "rgba(52,211,153,0.9)" },
];

// SFT 示例数据
const SFT_EXAMPLES = [
  {
    prompt: "解释什么是黑洞？",
    response: "黑洞是时空中引力极强的区域，连光都无法逃脱。它由大质量恒星坍缩形成，边界称为「事件视界」。",
    quality: "高质量标注数据",
  },
  {
    prompt: "写一首关于秋天的诗",
    response: "金叶随风舞，寒霜染林梢。候鸟南飞去，秋色满山峰。",
    quality: "高质量标注数据",
  },
  {
    prompt: "1+1等于多少？",
    response: "1+1=2。",
    quality: "简单问答对",
  },
];

// RM 对比数据
const RM_PAIRS = [
  {
    prompt: "如何提高代码质量？",
    responseA: "多写注释，代码会更好。",
    responseB: "代码质量可从多维度提升：① 遵循单一职责原则，函数只做一件事；② 写有意义的变量名；③ 添加单元测试；④ Code Review；⑤ 使用静态分析工具。",
    humanChoice: "B",
    rmScoreA: 2.1,
    rmScoreB: 8.7,
  },
  {
    prompt: "Python 和 JavaScript 的区别？",
    responseA: "Python 用于后端，JavaScript 用于前端。",
    responseB: "两者都是高级脚本语言，但有本质区别：Python 强调可读性（缩进强制）、主要用于数据科学/后端；JS 是浏览器原生语言，支持异步 Event Loop，近年 Node.js 也将其带到服务端。",
    humanChoice: "B",
    rmScoreA: 3.4,
    rmScoreB: 7.9,
  },
];

// PPO 迭代数据
const PPO_STEPS = [
  { iteration: 0, prompt: "给我推荐一本书", response: "《哈利波特》不错。", rmScore: 3.2, kl: 0.0 },
  { iteration: 1, prompt: "给我推荐一本书", response: "《哈利波特》是很好的选择，它构建了一个完整的魔法世界观。", rmScore: 5.8, kl: 0.12 },
  { iteration: 2, prompt: "给我推荐一本书", response: "我推荐《哈利波特》系列。这部小说不仅有精彩的故事，还深刻探讨了友谊、勇气与成长。适合各年龄段读者。", rmScore: 7.4, kl: 0.31 },
  { iteration: 3, prompt: "给我推荐一本书", response: "我推荐《哈利波特》！这部经典系列构建了宏大的魔法世界，情节扣人心弦，人物立体丰满，深刻探讨友谊与成长，老少咸宜，强烈推荐！太棒了！", rmScore: 6.1, kl: 1.82, warning: "奖励黑客：过度追求高分，回答变得冗余浮夸（KL 散度过大）" },
];

// ─── 主组件 ───────────────────────────────────────────────────────────────────
export default function RLHFVisualizer() {
  const [phase, setPhase] = useState<Phase>("sft");
  const [sftIdx, setSftIdx] = useState(0);
  const [rmIdx, setRmIdx] = useState(0);
  const [rmRevealed, setRmRevealed] = useState(false);
  const [ppoStep, setPpoStep] = useState(0);

  const curPhaseIdx = PHASES.findIndex((p) => p.id === phase);

  function nextPhase() {
    if (curPhaseIdx < PHASES.length - 1) {
      setPhase(PHASES[curPhaseIdx + 1].id);
      setRmRevealed(false);
    }
  }
  function prevPhase() {
    if (curPhaseIdx > 0) setPhase(PHASES[curPhaseIdx - 1].id);
  }

  return (
    <div className="space-y-5">
      {/* 流程总览 */}
      <div className="flex items-center gap-0">
        {PHASES.map((ph, i) => (
          <div key={ph.id} className="flex items-center flex-1">
            <button
              onClick={() => { setPhase(ph.id); setRmRevealed(false); }}
              className="flex-1 p-3 rounded-xl text-center transition-all cursor-pointer"
              style={{
                backgroundColor: phase === ph.id ? `${ph.color}18` : "var(--color-surface-2)",
                border: `1px solid ${phase === ph.id ? ph.color : "var(--color-border)"}`,
              }}
            >
              <div className="text-xs mb-0.5" style={{ color: ph.color, opacity: phase === ph.id ? 1 : 0.5 }}>{ph.step}</div>
              <div className="text-xs font-semibold" style={{ color: phase === ph.id ? "var(--color-text)" : "var(--color-text-muted)" }}>
                {ph.title.split("（")[0]}
              </div>
            </button>
            {i < PHASES.length - 1 && (
              <div className="text-xs mx-1" style={{ color: "var(--color-border)" }}>→</div>
            )}
          </div>
        ))}
      </div>

      {/* 当前阶段标题 */}
      {(() => {
        const ph = PHASES[curPhaseIdx];
        return (
          <div className="p-4 rounded-xl border" style={{ backgroundColor: `${ph.color}0d`, borderColor: ph.color + "40" }}>
            <div className="text-xs mb-0.5" style={{ color: ph.color }}>{ph.step}</div>
            <div className="text-base font-bold" style={{ color: "var(--color-text)" }}>{ph.title}</div>
            <div className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>{ph.subtitle}</div>
          </div>
        );
      })()}

      {/* ── 阶段 1：SFT ────────────────────────────────────────────────────────── */}
      {phase === "sft" && (
        <div className="space-y-3">
          <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
            收集高质量「提示词 → 优质回答」对，用监督学习让基础模型学习对话格式和基础指令跟随能力。
          </p>
          <div className="flex gap-2 flex-wrap">
            {SFT_EXAMPLES.map((ex, i) => (
              <button
                key={i}
                onClick={() => setSftIdx(i)}
                className="px-3 py-1.5 text-xs rounded-lg cursor-pointer transition-all"
                style={{
                  backgroundColor: sftIdx === i ? "rgba(96,165,250,0.15)" : "var(--color-surface-2)",
                  color: sftIdx === i ? "#60a5fa" : "var(--color-text-muted)",
                  border: `1px solid ${sftIdx === i ? "rgba(96,165,250,0.4)" : "var(--color-border)"}`,
                }}
              >
                示例 {i + 1}
              </button>
            ))}
          </div>
          {(() => {
            const ex = SFT_EXAMPLES[sftIdx];
            return (
              <div className="space-y-2">
                <div className="p-3 rounded-lg" style={{ backgroundColor: "var(--color-surface-2)", border: "1px solid var(--color-border)" }}>
                  <div className="text-xs mb-1" style={{ color: "rgba(96,165,250,0.8)" }}>用户提示词（Prompt）</div>
                  <div className="text-sm" style={{ color: "var(--color-text)" }}>「{ex.prompt}」</div>
                </div>
                <div className="flex justify-center">
                  <div className="text-xs px-3 py-1 rounded" style={{ backgroundColor: "rgba(96,165,250,0.1)", color: "rgba(96,165,250,0.8)" }}>
                    ↓ 人工标注高质量回答 ↓
                  </div>
                </div>
                <div className="p-3 rounded-lg" style={{ backgroundColor: "rgba(96,165,250,0.06)", border: "1px solid rgba(96,165,250,0.25)" }}>
                  <div className="text-xs mb-1" style={{ color: "rgba(96,165,250,0.8)" }}>标注回答（{ex.quality}）</div>
                  <div className="text-sm leading-relaxed" style={{ color: "var(--color-text)" }}>{ex.response}</div>
                </div>
                <div className="p-3 rounded-lg text-xs" style={{ backgroundColor: "var(--color-surface-2)", border: "1px solid var(--color-border)", color: "var(--color-text-muted)" }}>
                  <span className="font-semibold" style={{ color: "var(--color-text)" }}>训练方式：</span>
                  交叉熵损失，与普通语言模型预训练相同，只是数据换成了高质量对话对。OpenAI 约使用 100K 条 SFT 数据训练 InstructGPT。
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ── 阶段 2：RM ─────────────────────────────────────────────────────────── */}
      {phase === "rm" && (
        <div className="space-y-3">
          <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
            给定同一 Prompt，让模型生成多个回答，由人类标注员排序偏好。奖励模型（RM）从这些偏好对中学习「什么是好回答」。
          </p>
          <div className="flex gap-2">
            {RM_PAIRS.map((_, i) => (
              <button key={i} onClick={() => { setRmIdx(i); setRmRevealed(false); }}
                className="px-3 py-1.5 text-xs rounded-lg cursor-pointer transition-all"
                style={{ backgroundColor: rmIdx === i ? "rgba(251,191,36,0.15)" : "var(--color-surface-2)", color: rmIdx === i ? "#fbbf24" : "var(--color-text-muted)", border: `1px solid ${rmIdx === i ? "rgba(251,191,36,0.4)" : "var(--color-border)"}` }}
              >对比 {i + 1}</button>
            ))}
          </div>
          {(() => {
            const pair = RM_PAIRS[rmIdx];
            return (
              <div className="space-y-2">
                <div className="p-3 rounded-lg text-sm" style={{ backgroundColor: "var(--color-surface-2)", border: "1px solid var(--color-border)", color: "var(--color-text)" }}>
                  Prompt：「{pair.prompt}」
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {([["A", pair.responseA, pair.rmScoreA], ["B", pair.responseB, pair.rmScoreB]] as [string, string, number][]).map(([label, resp, score]) => {
                    const isWinner = label === pair.humanChoice;
                    return (
                      <div key={label} className="p-3 rounded-lg" style={{ backgroundColor: isWinner && rmRevealed ? "rgba(52,211,153,0.08)" : "var(--color-surface)", border: `1px solid ${isWinner && rmRevealed ? "rgba(52,211,153,0.4)" : "var(--color-border)"}` }}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold" style={{ color: "var(--color-text)" }}>回答 {label}</span>
                          {rmRevealed && (
                            <span className="text-xs font-mono" style={{ color: isWinner ? "rgba(52,211,153,0.9)" : "#f87171" }}>
                              RM: {score.toFixed(1)} {isWinner ? "✓" : "✗"}
                            </span>
                          )}
                        </div>
                        <p className="text-xs leading-relaxed" style={{ color: "var(--color-text-muted)" }}>{resp}</p>
                      </div>
                    );
                  })}
                </div>
                {!rmRevealed ? (
                  <button
                    onClick={() => setRmRevealed(true)}
                    className="w-full py-2 rounded-lg text-xs transition-all cursor-pointer"
                    style={{ backgroundColor: "rgba(251,191,36,0.1)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.3)" }}
                  >
                    人类选择了哪个？点击揭晓奖励模型打分 →
                  </button>
                ) : (
                  <div className="p-3 rounded-lg text-xs" style={{ backgroundColor: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.25)", color: "var(--color-text-muted)" }}>
                    <span className="font-semibold" style={{ color: "#fbbf24" }}>训练信号：</span>
                    人类选 {pair.humanChoice}，RM 用 Bradley-Terry 模型优化：最大化
                    log σ(r({pair.humanChoice}) − r({pair.humanChoice === "B" ? "A" : "B"}))，
                    使更好的回答得分更高。
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* ── 阶段 3：PPO ─────────────────────────────────────────────────────────── */}
      {phase === "ppo" && (
        <div className="space-y-3">
          <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
            冻结 RM，用 PPO 算法优化 SFT 策略：对每个生成结果计算奖励分，同时用 KL 惩罚防止模型偏离 SFT 版本太远（避免「奖励黑客」）。
          </p>

          {/* PPO 迭代步骤选择 */}
          <div className="flex gap-2">
            {PPO_STEPS.map((s, i) => (
              <button key={i} onClick={() => setPpoStep(i)}
                className="flex-1 py-2 rounded-lg text-xs transition-all cursor-pointer"
                style={{ backgroundColor: ppoStep === i ? "rgba(52,211,153,0.15)" : "var(--color-surface-2)", color: ppoStep === i ? "rgba(52,211,153,0.9)" : "var(--color-text-muted)", border: `1px solid ${ppoStep === i ? "rgba(52,211,153,0.4)" : "var(--color-border)"}` }}
              >
                迭代 {s.iteration}
              </button>
            ))}
          </div>

          {(() => {
            const s = PPO_STEPS[ppoStep];
            const maxScore = 8;
            return (
              <div className="space-y-2">
                {/* 回答 */}
                <div className="p-3 rounded-lg" style={{ backgroundColor: s.warning ? "rgba(248,113,113,0.06)" : "rgba(52,211,153,0.06)", border: `1px solid ${s.warning ? "rgba(248,113,113,0.3)" : "rgba(52,211,153,0.25)"}` }}>
                  <div className="text-xs mb-1" style={{ color: "var(--color-text-muted)" }}>Prompt：「{s.prompt}」</div>
                  <div className="text-sm leading-relaxed" style={{ color: "var(--color-text)" }}>{s.response}</div>
                </div>

                {/* 分数指标 */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg" style={{ backgroundColor: "var(--color-surface-2)", border: "1px solid var(--color-border)" }}>
                    <div className="text-xs mb-2 flex items-center justify-between">
                      <span style={{ color: "var(--color-text-muted)" }}>奖励模型分数（RM Score）</span>
                      <span className="font-mono" style={{ color: s.rmScore > 6 && !s.warning ? "rgba(52,211,153,0.9)" : s.warning ? "#f87171" : "#fbbf24" }}>
                        {s.rmScore.toFixed(1)} / {maxScore}
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full" style={{ backgroundColor: "var(--color-surface)" }}>
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{
                          width: `${(s.rmScore / maxScore) * 100}%`,
                          backgroundColor: s.warning ? "#f87171" : "rgba(52,211,153,0.8)",
                        }}
                      />
                    </div>
                  </div>
                  <div className="p-3 rounded-lg" style={{ backgroundColor: "var(--color-surface-2)", border: "1px solid var(--color-border)" }}>
                    <div className="text-xs mb-2 flex items-center justify-between">
                      <span style={{ color: "var(--color-text-muted)" }}>KL 散度（与 SFT 的偏离）</span>
                      <span className="font-mono" style={{ color: s.kl > 1 ? "#f87171" : "var(--color-accent)" }}>
                        {s.kl.toFixed(2)} {s.kl > 1 ? "⚠" : ""}
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full" style={{ backgroundColor: "var(--color-surface)" }}>
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{
                          width: `${Math.min(100, (s.kl / 2) * 100)}%`,
                          backgroundColor: s.kl > 1 ? "#f87171" : "var(--color-accent)",
                        }}
                      />
                    </div>
                  </div>
                </div>

                {s.warning && (
                  <div className="p-3 rounded-lg text-xs" style={{ backgroundColor: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.3)", color: "#f87171" }}>
                    ⚠ {s.warning}
                  </div>
                )}

                {!s.warning && ppoStep > 0 && (
                  <div className="p-3 rounded-lg text-xs" style={{ backgroundColor: "var(--color-surface-2)", border: "1px solid var(--color-border)", color: "var(--color-text-muted)" }}>
                    <span className="font-semibold" style={{ color: "var(--color-text)" }}>PPO 目标：</span>
                    最大化 RM(s.response) − β × KL(策略 ‖ SFT参考)，β 是 KL 惩罚系数（通常 0.1~0.5）。
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* 导航 */}
      <div className="flex gap-3">
        <button
          onClick={prevPhase}
          disabled={curPhaseIdx === 0}
          className="flex-1 py-2 rounded-lg text-sm transition-all cursor-pointer disabled:opacity-30"
          style={{ backgroundColor: "var(--color-surface-2)", color: "var(--color-text-muted)", border: "1px solid var(--color-border)" }}
        >
          ← 上一阶段
        </button>
        <button
          onClick={nextPhase}
          disabled={curPhaseIdx === PHASES.length - 1}
          className="flex-1 py-2 rounded-lg text-sm transition-all cursor-pointer disabled:opacity-30"
          style={{ backgroundColor: PHASES[curPhaseIdx].color + "cc", color: "white", border: "1px solid transparent" }}
        >
          下一阶段 →
        </button>
      </div>

      {/* 说明 */}
      <div
        className="p-4 rounded-xl border text-xs leading-relaxed space-y-2"
        style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}
      >
        <p>
          <strong style={{ color: "var(--color-text)" }}>RLHF 为什么有效？</strong>
          纯 SFT 难以区分「还不错」和「非常好」的回答，而人类偏好数据能提供更细粒度的质量信号，RM 将其量化后驱动 PPO 持续优化。
        </p>
        <p>
          <strong style={{ color: "var(--color-text)" }}>局限性与改进：</strong>
          RLHF 的 RM 训练成本高，PPO 不稳定。后继方法 DPO（直接偏好优化）绕过了显式 RM，直接从偏好数据优化策略，更简洁高效。
        </p>
      </div>
    </div>
  );
}
