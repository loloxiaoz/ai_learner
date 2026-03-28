"use client";

import { useState } from "react";
import { ATTENTION_EXAMPLES, type AttentionExample } from "@/lib/attentionData";

function weightToColor(w: number): string {
  const t = Math.pow(w, 0.6); // gamma 压缩，让低权重也可见
  const r = Math.round(20 + t * (160 - 20));
  const g = Math.round(10 + t * (40 - 10));
  const b = Math.round(40 + t * (250 - 40));
  return `rgb(${r},${g},${b})`;
}

function weightToOpacity(w: number): number {
  return 0.05 + w * 0.95;
}

interface Focus {
  row: number | null;
  col: number | null;
}

interface HeatmapProps {
  tokens: string[];
  weights: number[][];
  focus: Focus;
  onFocusChange: (f: Focus) => void;
}

function AttentionHeatmap({ tokens, weights, focus, onFocusChange }: HeatmapProps) {
  const { row: focusRow, col: focusCol } = focus;
  const n = tokens.length;
  const cellSize = Math.min(64, Math.floor(560 / (n + 1)));

  return (
    <div className="overflow-x-auto">
      <div style={{ display: "inline-block" }}>
        <div style={{ display: "flex", marginLeft: cellSize + 8 }}>
          <div style={{ width: 32 }} />
          {tokens.map((t, j) => (
            <div
              key={j}
              style={{
                width: cellSize,
                textAlign: "center",
                fontSize: "0.75rem",
                padding: "4px 2px",
                color: focusCol === j ? "var(--color-accent)" : "var(--color-text-muted)",
                fontWeight: focusCol === j ? 700 : 400,
                transition: "color 0.15s",
              }}
            >
              {t}
            </div>
          ))}
        </div>

        {tokens.map((rowTok, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", marginBottom: 3 }}>
            <div
              style={{
                width: cellSize,
                marginRight: 8,
                textAlign: "right",
                fontSize: "0.75rem",
                paddingRight: 8,
                color: focusRow === i ? "var(--color-accent)" : "var(--color-text-muted)",
                fontWeight: focusRow === i ? 700 : 400,
                transition: "color 0.15s",
                flexShrink: 0,
              }}
            >
              {rowTok}
            </div>
            <div style={{ width: 32 }} />
            {weights[i].map((w, j) => {
              const isRowFocus = focusRow === i;
              const isColFocus = focusCol === j;
              const dimmed = (focusRow !== null && !isRowFocus) || (focusCol !== null && !isColFocus);

              return (
                <div
                  key={j}
                  onMouseEnter={() => onFocusChange({ row: i, col: j })}
                  onMouseLeave={() => onFocusChange({ row: null, col: null })}
                  style={{
                    width: cellSize,
                    height: cellSize,
                    borderRadius: 6,
                    backgroundColor: weightToColor(w),
                    opacity: dimmed ? 0.2 : weightToOpacity(w),
                    cursor: "default",
                    transition: "opacity 0.15s, transform 0.1s",
                    transform: (isRowFocus && isColFocus) ? "scale(1.15)" : "scale(1)",
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 3,
                  }}
                >
                  {(isRowFocus || isColFocus) && (
                    <span style={{ fontSize: "0.6rem", color: "white", fontWeight: 700, userSelect: "none" }}>
                      {(w * 100).toFixed(0)}%
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ))}

        <div style={{ display: "flex", marginTop: 8, marginLeft: cellSize + 8 }}>
          <div style={{ width: 32 }} />
          <div style={{ fontSize: "0.7rem", color: "var(--color-text-muted)" }}>← 被关注的词 (Key)</div>
        </div>
        <div style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", marginTop: 4, marginLeft: 4 }}>
          ↑ 发出注意力的词 (Query)
        </div>
      </div>
    </div>
  );
}

function TokenAttentionBar({ tokens, weights, fromIdx }: { tokens: string[]; weights: number[]; fromIdx: number }) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs mb-2" style={{ color: "var(--color-text-muted)" }}>
        「{tokens[fromIdx]}」关注各词的权重：
      </p>
      {tokens.map((t, j) => (
        <div key={j} className="flex items-center gap-2">
          <span style={{ width: 48, fontSize: "0.75rem", textAlign: "right", color: "var(--color-text)", flexShrink: 0 }}>{t}</span>
          <div className="flex-1 h-5 rounded overflow-hidden" style={{ backgroundColor: "var(--color-surface-2)" }}>
            <div
              className="h-full rounded transition-all duration-500"
              style={{
                width: `${weights[j] * 100}%`,
                backgroundColor: weightToColor(weights[j]),
                opacity: 0.85,
              }}
            />
          </div>
          <span style={{ width: 36, fontSize: "0.7rem", color: "var(--color-text-muted)", fontFamily: "monospace" }}>
            {(weights[j] * 100).toFixed(1)}%
          </span>
        </div>
      ))}
    </div>
  );
}

const NULL_FOCUS: Focus = { row: null, col: null };

export default function AttentionVisualizer() {
  const [exampleIdx, setExampleIdx] = useState(0);
  const [headIdx, setHeadIdx] = useState(0);
  const [focus, setFocus] = useState<Focus>(NULL_FOCUS);

  const example: AttentionExample = ATTENTION_EXAMPLES[exampleIdx];
  const head = example.heads[headIdx];

  function switchExample(idx: number) {
    setExampleIdx(idx);
    setHeadIdx(0);
    setFocus(NULL_FOCUS);
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs mb-2" style={{ color: "var(--color-text-muted)" }}>选择示例句子：</p>
        <div className="flex flex-wrap gap-2">
          {ATTENTION_EXAMPLES.map((ex, i) => (
            <button
              key={ex.id}
              onClick={() => switchExample(i)}
              className="px-4 py-2 rounded-lg text-sm transition-all cursor-pointer"
              style={{
                backgroundColor: exampleIdx === i ? "var(--color-accent)" : "var(--color-surface-2)",
                color: exampleIdx === i ? "white" : "var(--color-text-muted)",
                border: `1px solid ${exampleIdx === i ? "var(--color-accent)" : "var(--color-border)"}`,
              }}
            >
              {ex.sentence}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs mb-2" style={{ color: "var(--color-text-muted)" }}>切换注意力头（每个头捕捉不同语言模式）：</p>
        <div className="flex flex-wrap gap-2">
          {example.heads.map((h, i) => (
            <button
              key={i}
              onClick={() => { setHeadIdx(i); setFocus(NULL_FOCUS); }}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer"
              style={{
                backgroundColor: headIdx === i ? "rgba(124,109,250,0.2)" : "var(--color-surface-2)",
                color: headIdx === i ? "var(--color-accent)" : "var(--color-text-muted)",
                border: `1px solid ${headIdx === i ? "var(--color-accent)" : "var(--color-border)"}`,
              }}
            >
              Head {i + 1}：{h.name}
            </button>
          ))}
        </div>
        <p className="text-xs mt-2 italic" style={{ color: "var(--color-text-muted)" }}>
          {head.description}
        </p>
      </div>

      <div
        className="p-5 rounded-xl border"
        style={{ backgroundColor: "var(--color-surface-2)", borderColor: "var(--color-border)" }}
      >
        <p className="text-xs mb-4" style={{ color: "var(--color-text-muted)" }}>
          悬停任意格子查看权重数值 · 颜色越亮 = 注意力权重越高
        </p>
        <AttentionHeatmap
          tokens={example.tokens}
          weights={head.weights}
          focus={focus}
          onFocusChange={setFocus}
        />
      </div>

      {focus.row !== null && (
        <div
          className="p-5 rounded-xl border transition-all"
          style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-accent)" }}
        >
          <TokenAttentionBar
            tokens={example.tokens}
            weights={head.weights[focus.row]}
            fromIdx={focus.row}
          />
        </div>
      )}

      <div
        className="p-5 rounded-xl border"
        style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
      >
        <h3 className="font-medium mb-3 text-sm" style={{ color: "var(--color-text)" }}>自注意力机制原理</h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Query (Q)", color: "#f59e0b", desc: "「我想关注什么？」每个词生成一个查询向量，表达自己的检索意图" },
            { label: "Key (K)", color: "#3b82f6", desc: "「我能提供什么？」每个词生成一个键向量，描述自己的语义内容" },
            { label: "Value (V)", color: "#7c6dfa", desc: "「我实际携带的信息」加权求和后形成新的词表示" },
          ].map(({ label, color, desc }) => (
            <div
              key={label}
              className="p-3 rounded-lg"
              style={{ backgroundColor: "var(--color-surface-2)" }}
            >
              <div className="font-mono text-xs font-bold mb-1" style={{ color }}>{label}</div>
              <p className="text-xs leading-relaxed" style={{ color: "var(--color-text-muted)" }}>{desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 p-3 rounded-lg font-mono text-xs" style={{ backgroundColor: "var(--color-surface-2)", color: "var(--color-accent-2)" }}>
          Attention(Q,K,V) = softmax(QK<sup>T</sup> / √d<sub>k</sub>) · V
        </div>
      </div>
    </div>
  );
}
