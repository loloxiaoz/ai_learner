"use client";

import { useState } from "react";

// ─── BPE 合并表（预计算，基于 "the cat sat on the mat" 这类英文短语）
// 也预置一些中文/代码场景
interface TokenExample {
  id: string;
  label: string;
  text: string;
  steps: BPEStep[];
}

interface BPEStep {
  desc: string;
  pair: string;
  tokens: string[][];   // 每个词的 token 列表
  mergedPair?: string;  // 新增合并后的 token
}

// 用颜色区分不同 token
const TOKEN_COLORS = [
  "rgba(124,109,250,0.75)",
  "rgba(249,115,22,0.75)",
  "rgba(52,211,153,0.75)",
  "rgba(96,165,250,0.75)",
  "rgba(251,191,36,0.75)",
  "rgba(192,132,252,0.75)",
  "rgba(248,113,113,0.75)",
  "rgba(45,212,191,0.75)",
];

const EXAMPLES: TokenExample[] = [
  {
    id: "en",
    label: "英文句子",
    text: "the cat sat on the mat",
    steps: [
      {
        desc: "初始状态：每个字符都是独立 Token（含词尾标记 </w>）",
        pair: "",
        tokens: [
          ["t","h","e","</w>"],
          ["c","a","t","</w>"],
          ["s","a","t","</w>"],
          ["o","n","</w>"],
          ["t","h","e","</w>"],
          ["m","a","t","</w>"],
        ],
      },
      {
        desc: "统计频率最高的相邻对：'t h' 出现 3 次（the×2, that） → 合并为 'th'",
        pair: "t + h → th",
        mergedPair: "th",
        tokens: [
          ["th","e","</w>"],
          ["c","a","t","</w>"],
          ["s","a","t","</w>"],
          ["o","n","</w>"],
          ["th","e","</w>"],
          ["m","a","t","</w>"],
        ],
      },
      {
        desc: "频率最高对：'th e' 出现 2 次 → 合并为 'the'",
        pair: "th + e → the",
        mergedPair: "the",
        tokens: [
          ["the","</w>"],
          ["c","a","t","</w>"],
          ["s","a","t","</w>"],
          ["o","n","</w>"],
          ["the","</w>"],
          ["m","a","t","</w>"],
        ],
      },
      {
        desc: "频率最高对：'a t' 出现 3 次（cat, sat, mat） → 合并为 'at'",
        pair: "a + t → at",
        mergedPair: "at",
        tokens: [
          ["the","</w>"],
          ["c","at","</w>"],
          ["s","at","</w>"],
          ["o","n","</w>"],
          ["the","</w>"],
          ["m","at","</w>"],
        ],
      },
      {
        desc: "频率最高对：'at </w>' 出现 3 次 → 合并为 'at</w>'（完整词尾子词）",
        pair: "at + </w> → at</w>",
        mergedPair: "at</w>",
        tokens: [
          ["the","</w>"],
          ["c","at</w>"],
          ["s","at</w>"],
          ["o","n","</w>"],
          ["the","</w>"],
          ["m","at</w>"],
        ],
      },
      {
        desc: "继续合并直到词汇表达到目标大小。最终词汇表包含：the</w>, c, s, at</w>, on</w>, m 等子词",
        pair: "完成",
        tokens: [
          ["the</w>"],
          ["c","at</w>"],
          ["s","at</w>"],
          ["on</w>"],
          ["the</w>"],
          ["m","at</w>"],
        ],
      },
    ],
  },
  {
    id: "oov",
    label: "未知词处理",
    text: "unhappy → un + happy（子词组合）",
    steps: [
      {
        desc: "BPE 最大优势：未见过的词 'unhappiness' 可拆分为已知子词",
        pair: "",
        tokens: [
          ["u","n","h","a","p","p","i","n","e","s","s","</w>"],
        ],
      },
      {
        desc: "合并 'h a' → 'ha'",
        pair: "h + a → ha",
        mergedPair: "ha",
        tokens: [
          ["u","n","ha","p","p","i","n","e","s","s","</w>"],
        ],
      },
      {
        desc: "合并 'p p' → 'pp'",
        pair: "p + p → pp",
        mergedPair: "pp",
        tokens: [
          ["u","n","ha","pp","i","n","e","s","s","</w>"],
        ],
      },
      {
        desc: "合并 'ha pp' → 'happ'",
        pair: "ha + pp → happ",
        mergedPair: "happ",
        tokens: [
          ["u","n","happ","i","n","e","s","s","</w>"],
        ],
      },
      {
        desc: "合并 'happ i' → 'happi'，再合并 's s' → 'ss'",
        pair: "happ + i → happi，s + s → ss",
        tokens: [
          ["u","n","happi","n","e","ss","</w>"],
        ],
      },
      {
        desc: "最终：'un' + 'happi' + 'ness</w>' — 即使训练中没见过 'unhappiness'，也能组合已知子词表示",
        pair: "最终分词结果",
        tokens: [
          ["un","happi","ness</w>"],
        ],
      },
    ],
  },
  {
    id: "code",
    label: "代码 Token",
    text: "def forward(self):",
    steps: [
      {
        desc: "代码分词：初始字符级切分",
        pair: "",
        tokens: [
          ["d","e","f"],
          ["f","o","r","w","a","r","d"],
          ["(","s","e","l","f",")"],
          [":",],
        ],
      },
      {
        desc: "高频关键字直接入词表：'def' 作为完整 token（编程语言词表常见优化）",
        pair: "d + e + f → def",
        mergedPair: "def",
        tokens: [
          ["def"],
          ["f","o","r","w","a","r","d"],
          ["(","self",")"],
          [":"],
        ],
      },
      {
        desc: "合并 'fo r' → 'for' → 再合并得 'forward'",
        pair: "for + ward → forward",
        mergedPair: "forward",
        tokens: [
          ["def"],
          ["forward"],
          ["(","self",")"],
          [":"],
        ],
      },
      {
        desc: "最终：[def] [Ġforward] [(] [self] [)] [:] — 关键字和标识符各自成为子词",
        pair: "完成",
        tokens: [
          ["def"],
          ["Ġforward"],
          ["(","self",")"],
          [":"],
        ],
      },
    ],
  },
];

// ─── 为每个 token 分配颜色（相同 token 颜色一致）──────────────────────────────
function assignColors(steps: BPEStep[]): Map<string, string> {
  const map = new Map<string, string>();
  let idx = 0;
  for (const step of steps) {
    for (const word of step.tokens) {
      for (const tok of word) {
        if (!map.has(tok)) {
          map.set(tok, TOKEN_COLORS[idx % TOKEN_COLORS.length]);
          idx++;
        }
      }
    }
  }
  return map;
}

// ─── 主组件 ───────────────────────────────────────────────────────────────────
export default function TokenizerVisualizer() {
  const [exIdx, setExIdx] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);

  const ex = EXAMPLES[exIdx];
  const step = ex.steps[stepIdx];
  const colorMap = assignColors(ex.steps);

  // 计算当前总 token 数
  const totalTokens = step.tokens.flat().length;
  const initTokens = ex.steps[0].tokens.flat().length;

  function switchExample(i: number) {
    setExIdx(i);
    setStepIdx(0);
  }

  return (
    <div className="space-y-5">
      {/* 示例选择 */}
      <div className="flex flex-wrap gap-2">
        {EXAMPLES.map((e, i) => (
          <button
            key={e.id}
            onClick={() => switchExample(i)}
            className="px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer"
            style={{
              backgroundColor: exIdx === i ? "rgba(124,109,250,0.2)" : "var(--color-surface-2)",
              color: exIdx === i ? "var(--color-accent)" : "var(--color-text-muted)",
              border: `1px solid ${exIdx === i ? "rgba(124,109,250,0.5)" : "var(--color-border)"}`,
            }}
          >
            {e.label}
          </button>
        ))}
      </div>

      {/* 原始文本 */}
      <div className="px-3 py-2 rounded-lg font-mono text-sm" style={{ backgroundColor: "var(--color-surface-2)", color: "var(--color-text)" }}>
        「{ex.text}」
      </div>

      {/* 步骤说明 */}
      <div
        className="p-4 rounded-xl border"
        style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
      >
        <div className="flex items-start gap-3">
          <div
            className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ backgroundColor: "rgba(124,109,250,0.2)", color: "var(--color-accent)" }}
          >
            {stepIdx + 1}
          </div>
          <div>
            <p className="text-sm" style={{ color: "var(--color-text)" }}>{step.desc}</p>
            {step.pair && step.pair !== "完成" && (
              <div
                className="mt-2 inline-block font-mono text-xs px-3 py-1 rounded"
                style={{ backgroundColor: "rgba(249,115,22,0.12)", color: "rgba(249,115,22,0.9)", border: "1px solid rgba(249,115,22,0.3)" }}
              >
                合并：{step.pair}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Token 可视化 */}
      <div
        className="p-4 rounded-xl border min-h-24"
        style={{ backgroundColor: "var(--color-surface-2)", borderColor: "var(--color-border)" }}
      >
        <div className="flex items-center gap-1 mb-3">
          <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>Token 序列：</span>
          <span className="text-xs font-mono ml-auto" style={{ color: totalTokens < initTokens ? "rgba(52,211,153,0.9)" : "var(--color-text-muted)" }}>
            {totalTokens} tokens
            {stepIdx > 0 && totalTokens < initTokens && (
              <span style={{ color: "rgba(52,211,153,0.9)" }}> （-{initTokens - totalTokens}）</span>
            )}
          </span>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-3">
          {step.tokens.map((word, wi) => (
            <div key={wi} className="flex items-center gap-0.5">
              {word.map((tok, ti) => (
                <span
                  key={ti}
                  className="inline-block px-1.5 py-0.5 rounded text-xs font-mono"
                  style={{
                    backgroundColor: colorMap.get(tok) ?? "rgba(124,109,250,0.3)",
                    color: "white",
                    border: step.mergedPair && tok === step.mergedPair ? "1.5px solid white" : "1px solid transparent",
                    fontWeight: step.mergedPair && tok === step.mergedPair ? 700 : 400,
                    transform: step.mergedPair && tok === step.mergedPair ? "scale(1.1)" : "scale(1)",
                    transition: "all 0.3s",
                  }}
                >
                  {tok === "</w>" ? "⌁" : tok}
                </span>
              ))}
              {wi < step.tokens.length - 1 && (
                <span className="ml-1 text-xs" style={{ color: "var(--color-text-muted)" }}>·</span>
              )}
            </div>
          ))}
        </div>
        {step.mergedPair && step.pair !== "完成" && (
          <div className="mt-3 text-xs" style={{ color: "var(--color-text-muted)" }}>
            <span style={{ border: "1.5px solid white", borderRadius: 3, padding: "0 4px", marginRight: 4 }}>白框</span>
            为本步新合并的 Token
          </div>
        )}
      </div>

      {/* 步骤进度 + 导航 */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => stepIdx > 0 && setStepIdx(stepIdx - 1)}
          disabled={stepIdx === 0}
          className="px-4 py-2 rounded-lg text-sm transition-all cursor-pointer disabled:opacity-30"
          style={{ backgroundColor: "var(--color-surface-2)", color: "var(--color-text-muted)", border: "1px solid var(--color-border)" }}
        >
          ← 上一步
        </button>
        <div className="flex-1 flex gap-1">
          {ex.steps.map((_, i) => (
            <button
              key={i}
              onClick={() => setStepIdx(i)}
              className="flex-1 h-1.5 rounded-full transition-all cursor-pointer"
              style={{ backgroundColor: i <= stepIdx ? "var(--color-accent)" : "var(--color-border)" }}
            />
          ))}
        </div>
        <span className="text-xs font-mono w-14 text-center" style={{ color: "var(--color-text-muted)" }}>
          {stepIdx + 1}/{ex.steps.length}
        </span>
        <button
          onClick={() => stepIdx < ex.steps.length - 1 && setStepIdx(stepIdx + 1)}
          disabled={stepIdx === ex.steps.length - 1}
          className="px-4 py-2 rounded-lg text-sm transition-all cursor-pointer disabled:opacity-30"
          style={{ backgroundColor: stepIdx < ex.steps.length - 1 ? "rgba(124,109,250,0.85)" : "var(--color-surface-2)", color: "white", border: "1px solid transparent" }}
        >
          下一步 →
        </button>
      </div>

      {/* 知识点 */}
      <div
        className="p-4 rounded-xl border text-xs leading-relaxed space-y-2"
        style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}
      >
        <p>
          <strong style={{ color: "var(--color-text)" }}>BPE（Byte Pair Encoding）核心思路：</strong>
          从字符级起步，反复找频率最高的相邻字符对并合并，直到词汇表达到目标大小（GPT-4 约 100K）。
        </p>
        <p>
          <strong style={{ color: "var(--color-text)" }}>为什么不用整词切分？</strong>
          词汇量爆炸（百万级），且无法处理未登录词（OOV）。BPE 的子词粒度在「语义完整」与「词表大小」间取得平衡。
        </p>
        <p>
          <strong style={{ color: "var(--color-text)" }}>WordPiece vs BPE：</strong>
          BERT 使用 WordPiece（最大化训练数据概率），策略略有不同但本质相似。SentencePiece 则将空格也视为字符，可直接处理中文。
        </p>
      </div>
    </div>
  );
}
