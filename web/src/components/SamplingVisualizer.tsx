"use client";

import { useState, useMemo } from "react";

// ─── 示例词汇表 ───────────────────────────────────────────────────────────────
interface TokenSet {
  id: string;
  context: string;
  tokens: { word: string; logit: number }[];
}

const TOKEN_SETS: TokenSet[] = [
  {
    id: "cat",
    context: "今天天气很好，我想去...",
    tokens: [
      { word: "公园", logit: 3.8 },
      { word: "超市", logit: 2.1 },
      { word: "图书馆", logit: 1.7 },
      { word: "海边", logit: 1.5 },
      { word: "电影院", logit: 0.9 },
      { word: "健身房", logit: 0.4 },
      { word: "山上", logit: 0.1 },
      { word: "公司", logit: -0.5 },
    ],
  },
  {
    id: "code",
    context: "def sort(arr): return...",
    tokens: [
      { word: "sorted(arr)", logit: 4.2 },
      { word: "arr.sort()", logit: 2.8 },
      { word: "quicksort(arr)", logit: 1.3 },
      { word: "arr[::-1]", logit: 0.7 },
      { word: "None", logit: -0.2 },
      { word: "True", logit: -0.8 },
      { word: "[]", logit: -1.5 },
      { word: "42", logit: -2.1 },
    ],
  },
  {
    id: "creative",
    context: "夜深了，窗外的雨...",
    tokens: [
      { word: "淅淅沥沥", logit: 2.1 },
      { word: "哗哗作响", logit: 2.0 },
      { word: "停了", logit: 1.9 },
      { word: "越下越大", logit: 1.8 },
      { word: "打在玻璃上", logit: 1.7 },
      { word: "让人难以入睡", logit: 1.6 },
      { word: "倒映着城市的灯光", logit: 1.5 },
      { word: "带来了秋天的气息", logit: 1.4 },
    ],
  },
];

// ─── Softmax with temperature ────────────────────────────────────────────────
function softmax(logits: number[], temperature: number): number[] {
  const scaled = logits.map((l) => l / temperature);
  const maxL = Math.max(...scaled);
  const exps = scaled.map((l) => Math.exp(l - maxL));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((e) => e / sum);
}

// ─── SVG 参数 ─────────────────────────────────────────────────────────────────
const BAR_H = 26, BAR_GAP = 4, BAR_PAD_L = 96, BAR_PAD_R = 80, BAR_W_TOTAL = 460;

// ─── 主组件 ───────────────────────────────────────────────────────────────────
export default function SamplingVisualizer() {
  const [setIdx, setSetIdx] = useState(0);
  const [temperature, setTemperature] = useState(1.0);
  const [topK, setTopK] = useState(0); // 0 = 禁用
  const [topP, setTopP] = useState(1.0); // 1.0 = 禁用
  const [sampled, setSampled] = useState<string | null>(null);

  const ts = TOKEN_SETS[setIdx];
  const logits = ts.tokens.map((t) => t.logit);

  // 计算原始概率
  const probs = useMemo(() => softmax(logits, temperature), [logits, temperature]);

  // Top-K 过滤
  const afterTopK = useMemo(() => {
    if (topK === 0 || topK >= probs.length) return probs;
    const sorted = [...probs].map((p, i) => ({ p, i })).sort((a, b) => b.p - a.p);
    const mask = new Array(probs.length).fill(0);
    sorted.slice(0, topK).forEach(({ i }) => { mask[i] = 1; });
    const masked = probs.map((p, i) => mask[i] ? p : 0);
    const sum = masked.reduce((a, b) => a + b, 0);
    return masked.map((p) => p / sum);
  }, [probs, topK]);

  // Top-P 过滤（在 Top-K 之后应用）
  const finalProbs = useMemo(() => {
    if (topP >= 1.0) return afterTopK;
    const sorted = [...afterTopK].map((p, i) => ({ p, i })).sort((a, b) => b.p - a.p);
    let cumsum = 0;
    const mask = new Array(afterTopK.length).fill(0);
    for (const { p, i } of sorted) {
      if (cumsum >= topP) break;
      mask[i] = 1;
      cumsum += p;
    }
    const masked = afterTopK.map((p, i) => mask[i] ? p : 0);
    const sum = masked.reduce((a, b) => a + b, 0);
    return sum > 0 ? masked.map((p) => p / sum) : masked;
  }, [afterTopK, topP]);

  // 采样
  function doSample() {
    const r = Math.random();
    let cum = 0;
    for (let i = 0; i < finalProbs.length; i++) {
      cum += finalProbs[i];
      if (r < cum) {
        setSampled(ts.tokens[i].word);
        return;
      }
    }
    setSampled(ts.tokens[ts.tokens.length - 1].word);
  }

  const maxProb = Math.max(...finalProbs.filter((p) => p > 0), 0.001);
  const maxW = BAR_W_TOTAL - BAR_PAD_L - BAR_PAD_R;
  const svgH = ts.tokens.length * (BAR_H + BAR_GAP) + 10;

  const isActive = (i: number) => finalProbs[i] > 0.0001;

  return (
    <div className="space-y-5">
      {/* 上下文选择 */}
      <div>
        <p className="text-xs mb-2" style={{ color: "var(--color-text-muted)" }}>选择上下文场景：</p>
        <div className="flex flex-wrap gap-2">
          {TOKEN_SETS.map((ts, i) => (
            <button
              key={ts.id}
              onClick={() => { setSetIdx(i); setSampled(null); }}
              className="px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer"
              style={{
                backgroundColor: setIdx === i ? "rgba(124,109,250,0.2)" : "var(--color-surface-2)",
                color: setIdx === i ? "var(--color-accent)" : "var(--color-text-muted)",
                border: `1px solid ${setIdx === i ? "rgba(124,109,250,0.4)" : "var(--color-border)"}`,
              }}
            >
              {ts.context.slice(0, 14)}...
            </button>
          ))}
        </div>
        <div className="mt-2 px-3 py-2 rounded-lg text-sm font-mono" style={{ backgroundColor: "var(--color-surface-2)", color: "var(--color-text)" }}>
          「{ts.context}」
          {sampled && <span style={{ color: "rgba(86,212,179,0.9)" }}> {sampled}</span>}
        </div>
      </div>

      {/* 参数控制 */}
      <div className="grid grid-cols-1 gap-3" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
        {/* Temperature */}
        <div className="p-3 rounded-xl border" style={{ backgroundColor: "var(--color-surface-2)", borderColor: "var(--color-border)" }}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold" style={{ color: "#f87171" }}>Temperature</span>
            <span className="text-xs font-mono" style={{ color: "#f87171" }}>{temperature.toFixed(2)}</span>
          </div>
          <input
            type="range" min={0.1} max={3} step={0.05} value={temperature}
            onChange={(e) => { setTemperature(Number(e.target.value)); setSampled(null); }}
            className="w-full accent-red-400"
          />
          <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
            {temperature < 0.5 ? "极低 → 近贪心解码，确定性强" : temperature < 1 ? "偏低 → 倾向高概率词" : temperature < 1.5 ? "标准 → 均衡多样性" : "偏高 → 更随机，更有创意"}
          </p>
        </div>

        {/* Top-K */}
        <div className="p-3 rounded-xl border" style={{ backgroundColor: "var(--color-surface-2)", borderColor: "var(--color-border)" }}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold" style={{ color: "#60a5fa" }}>Top-K</span>
            <span className="text-xs font-mono" style={{ color: "#60a5fa" }}>{topK === 0 ? "禁用" : topK}</span>
          </div>
          <input
            type="range" min={0} max={8} step={1} value={topK}
            onChange={(e) => { setTopK(Number(e.target.value)); setSampled(null); }}
            className="w-full accent-blue-400"
          />
          <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
            {topK === 0 ? "不过滤（考虑所有词）" : `只保留概率最高的 ${topK} 个词`}
          </p>
        </div>

        {/* Top-P */}
        <div className="p-3 rounded-xl border" style={{ backgroundColor: "var(--color-surface-2)", borderColor: "var(--color-border)" }}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold" style={{ color: "#34d399" }}>Top-P（核采样）</span>
            <span className="text-xs font-mono" style={{ color: "#34d399" }}>{topP.toFixed(2)}</span>
          </div>
          <input
            type="range" min={0.1} max={1.0} step={0.05} value={topP}
            onChange={(e) => { setTopP(Number(e.target.value)); setSampled(null); }}
            className="w-full accent-green-400"
          />
          <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
            {topP >= 1.0 ? "不过滤（考虑所有词）" : `保留累积概率达 ${(topP * 100).toFixed(0)}% 的最小词集`}
          </p>
        </div>
      </div>

      {/* 概率条形图 */}
      <div
        className="p-4 rounded-xl border overflow-x-auto"
        style={{ backgroundColor: "var(--color-surface-2)", borderColor: "var(--color-border)" }}
      >
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
            过滤后的候选词概率分布（灰色 = 被过滤排除）
          </p>
          <button
            onClick={doSample}
            className="px-4 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer"
            style={{ backgroundColor: "rgba(86,212,179,0.15)", color: "rgba(86,212,179,0.9)", border: "1px solid rgba(86,212,179,0.3)" }}
          >
            🎲 采样一个词
          </button>
        </div>
        <svg width={BAR_W_TOTAL} height={svgH} style={{ display: "block", margin: "0 auto" }}>
          {ts.tokens.map((tok, i) => {
            const active = isActive(i);
            const barW = active ? (finalProbs[i] / maxProb) * maxW : (probs[i] / Math.max(...probs)) * maxW * 0.3;
            const y = i * (BAR_H + BAR_GAP) + 2;
            const isSampled = sampled === tok.word;
            return (
              <g key={i}>
                {/* 标签 */}
                <text
                  x={BAR_PAD_L - 6}
                  y={y + BAR_H / 2 + 4}
                  textAnchor="end"
                  style={{ fontSize: "0.65rem", fill: active ? "var(--color-text)" : "var(--color-text-muted)", fontWeight: isSampled ? 700 : 400 }}
                >
                  {tok.word}
                </text>
                {/* 条形 */}
                <rect
                  x={BAR_PAD_L}
                  y={y + 2}
                  width={Math.max(2, barW)}
                  height={BAR_H - 4}
                  rx={3}
                  fill={
                    isSampled
                      ? "rgba(86,212,179,0.8)"
                      : active
                        ? "rgba(124,109,250,0.65)"
                        : "rgba(0,0,0,0.05)"
                  }
                  style={{ transition: "width 0.3s ease" }}
                />
                {/* 数值 */}
                <text
                  x={BAR_PAD_L + Math.max(2, barW) + 6}
                  y={y + BAR_H / 2 + 4}
                  style={{ fontSize: "0.6rem", fill: active ? (isSampled ? "rgba(86,212,179,0.9)" : "var(--color-accent)") : "var(--color-text-muted)", fontFamily: "monospace" }}
                >
                  {active ? (finalProbs[i] * 100).toFixed(1) + "%" : "×"}
                </text>
                {/* logit */}
                <text
                  x={BAR_W_TOTAL - 4}
                  y={y + BAR_H / 2 + 4}
                  textAnchor="end"
                  style={{ fontSize: "0.55rem", fill: "var(--color-text-muted)", fontFamily: "monospace" }}
                >
                  {tok.logit > 0 ? "+" : ""}{tok.logit.toFixed(1)}
                </text>
              </g>
            );
          })}
        </svg>
        <div className="text-right mt-1">
          <span className="text-xs font-mono" style={{ color: "var(--color-text-muted)" }}>logit →</span>
        </div>
      </div>

      {/* 原理说明 */}
      <div
        className="p-4 rounded-xl border text-xs leading-relaxed space-y-2"
        style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}
      >
        <p>
          <strong style={{ color: "#f87171" }}>Temperature：</strong>
          将 logit 除以 T 后做 softmax。T→0 时概率集中于最大值（贪心），T→∞ 时趋于均匀分布。
        </p>
        <p>
          <strong style={{ color: "#60a5fa" }}>Top-K：</strong>
          保留概率最高的 K 个词，其余置零后重新归一化。防止模型选中极低概率的离谱词。
        </p>
        <p>
          <strong style={{ color: "#34d399" }}>Top-P（核采样）：</strong>
          按概率从高到低累加，直到累积概率超过 P，保留这个最小词集。P=0.9 时自动适应词表宽度。
        </p>
        <p>
          <strong style={{ color: "var(--color-text)" }}>生产实践：</strong>
          ChatGPT 等通常设置 temperature≈0.7~1.0、top_p≈0.9，在创意性和准确性间取得平衡。代码生成任务常用低 temperature（更确定）。
        </p>
      </div>
    </div>
  );
}
