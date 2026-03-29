"use client";

import { useState, useRef } from "react";

// ─── 词向量数据（预计算 2D PCA 坐标）────────────────────────────────────────
interface Word {
  word: string;
  x: number;   // 0..1
  y: number;   // 0..1
  group: string;
}

const WORDS: Word[] = [
  // 皇室
  { word: "king",     x: 0.12, y: 0.82, group: "royalty" },
  { word: "queen",    x: 0.18, y: 0.74, group: "royalty" },
  { word: "prince",   x: 0.10, y: 0.68, group: "royalty" },
  { word: "princess", x: 0.22, y: 0.62, group: "royalty" },
  { word: "emperor",  x: 0.06, y: 0.76, group: "royalty" },

  // 性别
  { word: "man",   x: 0.32, y: 0.52, group: "gender" },
  { word: "woman", x: 0.38, y: 0.58, group: "gender" },
  { word: "boy",   x: 0.28, y: 0.46, group: "gender" },
  { word: "girl",  x: 0.42, y: 0.52, group: "gender" },

  // 动物
  { word: "cat",   x: 0.14, y: 0.22, group: "animal" },
  { word: "dog",   x: 0.20, y: 0.16, group: "animal" },
  { word: "horse", x: 0.08, y: 0.14, group: "animal" },
  { word: "bird",  x: 0.24, y: 0.26, group: "animal" },
  { word: "fish",  x: 0.10, y: 0.30, group: "animal" },

  // 科技
  { word: "AI",       x: 0.76, y: 0.84, group: "tech" },
  { word: "robot",    x: 0.84, y: 0.76, group: "tech" },
  { word: "model",    x: 0.70, y: 0.72, group: "tech" },
  { word: "computer", x: 0.78, y: 0.68, group: "tech" },
  { word: "neural",   x: 0.72, y: 0.80, group: "tech" },

  // 国家
  { word: "China",   x: 0.74, y: 0.26, group: "country" },
  { word: "France",  x: 0.68, y: 0.18, group: "country" },
  { word: "Japan",   x: 0.80, y: 0.14, group: "country" },
  { word: "Germany", x: 0.62, y: 0.22, group: "country" },
  { word: "Italy",   x: 0.72, y: 0.10, group: "country" },

  // 情感
  { word: "happy",    x: 0.50, y: 0.65, group: "emotion" },
  { word: "sad",      x: 0.44, y: 0.42, group: "emotion" },
  { word: "angry",    x: 0.52, y: 0.38, group: "emotion" },
  { word: "love",     x: 0.56, y: 0.70, group: "emotion" },
  { word: "fear",     x: 0.40, y: 0.48, group: "emotion" },
];

const GROUP_COLORS: Record<string, string> = {
  royalty: "rgba(251,191,36,0.9)",
  gender:  "rgba(96,165,250,0.9)",
  animal:  "rgba(52,211,153,0.9)",
  tech:    "rgba(192,132,252,0.9)",
  country: "rgba(248,113,113,0.9)",
  emotion: "rgba(249,115,22,0.9)",
};

const GROUP_LABELS: Record<string, string> = {
  royalty: "皇室",
  gender:  "性别",
  animal:  "动物",
  tech:    "科技",
  country: "国家",
  emotion: "情感",
};

// ─── 类比定义 ─────────────────────────────────────────────────────────────────
const ANALOGIES = [
  {
    label: "king − man + woman = ?",
    a: "king", b: "man", c: "woman", result: "queen",
    desc: "皇室概念（king）减去男性特征（man），加上女性特征（woman），得到女性皇室（queen）",
  },
  {
    label: "prince − man + woman = ?",
    a: "prince", b: "man", c: "woman", result: "princess",
    desc: "同样的性别替换逻辑适用于所有皇室词汇，体现 word2vec 的线性语义结构",
  },
  {
    label: "China + 首都 ≈ 北京（类比）",
    a: "Japan", b: "China", c: "France", result: "Germany",
    desc: "欧洲国家向量在空间中彼此相邻，体现地理语义聚类",
  },
];

const W = 460, H = 360, PAD = 40;

function toSvg(x: number, y: number) {
  return {
    sx: PAD + x * (W - PAD * 2),
    sy: H - PAD - y * (H - PAD * 2),
  };
}

// ─── 主组件 ───────────────────────────────────────────────────────────────────
export default function WordEmbeddingVisualizer() {
  const [hoveredWord, setHoveredWord] = useState<string | null>(null);
  const [analogyIdx, setAnalogyIdx] = useState<number | null>(null);
  const [showGroups, setShowGroups] = useState(true);
  const svgRef = useRef<SVGSVGElement>(null);

  const analogy = analogyIdx !== null ? ANALOGIES[analogyIdx] : null;

  const wordMap = Object.fromEntries(WORDS.map((w) => [w.word, w]));

  function nearestWords(word: string, n = 4): string[] {
    const w = wordMap[word];
    if (!w) return [];
    return WORDS
      .filter((v) => v.word !== word)
      .map((v) => ({ word: v.word, dist: Math.hypot(v.x - w.x, v.y - w.y) }))
      .sort((a, b) => a.dist - b.dist)
      .slice(0, n)
      .map((v) => v.word);
  }

  const hovered = hoveredWord ? wordMap[hoveredWord] : null;
  const neighbors = hoveredWord ? nearestWords(hoveredWord) : [];

  return (
    <div className="space-y-4">
      {/* 控制栏 */}
      <div className="flex flex-wrap gap-2 items-center">
        <button
          onClick={() => setShowGroups(!showGroups)}
          className="px-3 py-1.5 text-xs rounded-lg cursor-pointer transition-all"
          style={{ backgroundColor: showGroups ? "rgba(124,109,250,0.2)" : "var(--color-surface-2)", color: showGroups ? "var(--color-accent)" : "var(--color-text-muted)", border: `1px solid ${showGroups ? "rgba(124,109,250,0.4)" : "var(--color-border)"}` }}
        >
          {showGroups ? "● 按类别着色" : "○ 统一颜色"}
        </button>
        <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>类比演示：</span>
        {ANALOGIES.map((a, i) => (
          <button
            key={i}
            onClick={() => setAnalogyIdx(analogyIdx === i ? null : i)}
            className="px-3 py-1.5 text-xs rounded-lg cursor-pointer transition-all font-mono"
            style={{ backgroundColor: analogyIdx === i ? "rgba(249,115,22,0.15)" : "var(--color-surface-2)", color: analogyIdx === i ? "rgba(249,115,22,0.9)" : "var(--color-text-muted)", border: `1px solid ${analogyIdx === i ? "rgba(249,115,22,0.4)" : "var(--color-border)"}` }}
          >
            {a.label.split("=")[0]}= ?
          </button>
        ))}
      </div>

      {/* 词向量空间 */}
      <div
        className="p-3 rounded-xl border"
        style={{ backgroundColor: "var(--color-surface-2)", borderColor: "var(--color-border)" }}
      >
        <p className="text-xs mb-2 text-center" style={{ color: "var(--color-text-muted)" }}>
          2D 词向量空间（PCA 降维示意）· 悬停查看近邻词
        </p>
        <svg
          ref={svgRef}
          width={W} height={H}
          style={{ display: "block", margin: "0 auto" }}
          onMouseLeave={() => setHoveredWord(null)}
        >
          {/* 背景聚类区域 */}
          {showGroups && Object.entries(GROUP_COLORS).map(([group, color]) => {
            const pts = WORDS.filter((w) => w.group === group);
            if (pts.length === 0) return null;
            const minX = Math.min(...pts.map((p) => p.x)) - 0.05;
            const maxX = Math.max(...pts.map((p) => p.x)) + 0.05;
            const minY = Math.min(...pts.map((p) => p.y)) - 0.05;
            const maxY = Math.max(...pts.map((p) => p.y)) + 0.05;
            const { sx: x1, sy: y1 } = toSvg(minX, maxY);
            const { sx: x2, sy: y2 } = toSvg(maxX, minY);
            return (
              <rect
                key={group}
                x={x1} y={y1} width={x2 - x1} height={y2 - y1}
                rx={8}
                fill={color.replace("0.9", "0.07")}
                stroke={color.replace("0.9", "0.2")}
                strokeWidth={1}
              />
            );
          })}

          {/* 类比向量 */}
          {analogy && (() => {
            const wa = wordMap[analogy.a];
            const wb = wordMap[analogy.b];
            const wc = wordMap[analogy.c];
            const wr = wordMap[analogy.result];
            if (!wa || !wb || !wc || !wr) return null;
            const pa = toSvg(wa.x, wa.y);
            const pb = toSvg(wb.x, wb.y);
            const pc = toSvg(wc.x, wc.y);
            const pr = toSvg(wr.x, wr.y);
            // a→b 向量（减法）
            // c→result 向量（平移）
            return (
              <g>
                {/* a - b 向量 */}
                <defs>
                  <marker id="arrowO" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                    <path d="M0,0 L6,3 L0,6 Z" fill="rgba(249,115,22,0.8)" />
                  </marker>
                  <marker id="arrowG" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                    <path d="M0,0 L6,3 L0,6 Z" fill="rgba(52,211,153,0.8)" />
                  </marker>
                </defs>
                <line x1={pa.sx} y1={pa.sy} x2={pb.sx} y2={pb.sy} stroke="rgba(249,115,22,0.6)" strokeWidth={1.5} strokeDasharray="4,3" markerEnd="url(#arrowO)" />
                <text x={(pa.sx + pb.sx) / 2 + 5} y={(pa.sy + pb.sy) / 2 - 5} style={{ fontSize: "0.55rem", fill: "rgba(249,115,22,0.8)" }}>−{analogy.b}</text>
                {/* c + (a-b) = result */}
                <line x1={pc.sx} y1={pc.sy} x2={pr.sx} y2={pr.sy} stroke="rgba(52,211,153,0.7)" strokeWidth={1.5} markerEnd="url(#arrowG)" />
                <text x={(pc.sx + pr.sx) / 2 + 5} y={(pc.sy + pr.sy) / 2 - 5} style={{ fontSize: "0.55rem", fill: "rgba(52,211,153,0.8)" }}>+{analogy.b}→?</text>
                {/* 结果高亮 */}
                <circle cx={pr.sx} cy={pr.sy} r={10} fill="rgba(52,211,153,0.2)" stroke="rgba(52,211,153,0.9)" strokeWidth={2} />
              </g>
            );
          })()}

          {/* 悬停近邻连线 */}
          {hovered && neighbors.map((nb) => {
            const nw = wordMap[nb];
            const ph = toSvg(hovered.x, hovered.y);
            const pn = toSvg(nw.x, nw.y);
            return (
              <line key={nb} x1={ph.sx} y1={ph.sy} x2={pn.sx} y2={pn.sy} stroke="rgba(0,0,0,0.12)" strokeWidth={1} strokeDasharray="3,3" />
            );
          })}

          {/* 词点 */}
          {WORDS.map((w) => {
            const { sx, sy } = toSvg(w.x, w.y);
            const color = showGroups ? GROUP_COLORS[w.group] : "rgba(124,109,250,0.8)";
            const isHovered = hoveredWord === w.word;
            const isNeighbor = neighbors.includes(w.word);
            const isAnalogy = analogy && [analogy.a, analogy.b, analogy.c, analogy.result].includes(w.word);
            const r = isHovered ? 7 : isAnalogy ? 7 : isNeighbor ? 5 : 4;
            return (
              <g key={w.word} style={{ cursor: "pointer" }} onMouseEnter={() => setHoveredWord(w.word)}>
                <circle cx={sx} cy={sy} r={r + 4} fill="transparent" />
                <circle
                  cx={sx} cy={sy} r={r}
                  fill={isAnalogy && analogy?.result === w.word ? "rgba(52,211,153,0.9)" : color}
                  stroke={isHovered ? "white" : isAnalogy ? "white" : "transparent"}
                  strokeWidth={1.5}
                  opacity={isHovered || isNeighbor || isAnalogy ? 1 : hoveredWord ? 0.3 : 1}
                  style={{ transition: "all 0.2s" }}
                />
                <text
                  x={sx + r + 3} y={sy + 4}
                  style={{
                    fontSize: isHovered || isAnalogy ? "0.65rem" : "0.55rem",
                    fill: isHovered ? "white" : isAnalogy ? (analogy?.result === w.word ? "rgba(52,211,153,0.95)" : "rgba(249,115,22,0.9)") : isNeighbor ? "var(--color-text)" : "var(--color-text-muted)",
                    fontWeight: isHovered || isAnalogy ? 700 : 400,
                    opacity: hoveredWord && !isHovered && !isNeighbor && !isAnalogy ? 0.3 : 1,
                    transition: "all 0.2s",
                    pointerEvents: "none",
                  }}
                >
                  {w.word}
                </text>
              </g>
            );
          })}
        </svg>

        {/* 类别图例 */}
        {showGroups && (
          <div className="flex flex-wrap gap-3 justify-center mt-2">
            {Object.entries(GROUP_LABELS).map(([group, label]) => (
              <div key={group} className="flex items-center gap-1.5 text-xs">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: GROUP_COLORS[group] }} />
                <span style={{ color: "var(--color-text-muted)" }}>{label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 悬停信息 */}
      {hovered && (
        <div className="p-3 rounded-xl border text-xs" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}>
          <span className="font-semibold" style={{ color: GROUP_COLORS[hovered.group] }}>{hovered.word}</span>
          <span className="ml-2" style={{ color: "var(--color-text-muted)" }}>({GROUP_LABELS[hovered.group]})</span>
          <span className="ml-4" style={{ color: "var(--color-text-muted)" }}>最近邻：</span>
          {neighbors.map((nb) => (
            <span key={nb} className="ml-2 font-mono" style={{ color: "var(--color-text)" }}>{nb}</span>
          ))}
        </div>
      )}

      {/* 类比说明 */}
      {analogy && (
        <div className="p-3 rounded-xl border text-xs" style={{ backgroundColor: "rgba(249,115,22,0.06)", borderColor: "rgba(249,115,22,0.3)" }}>
          <div className="font-mono mb-1" style={{ color: "rgba(249,115,22,0.9)" }}>
            {analogy.a} − {analogy.b} + {analogy.c} ≈ <span style={{ color: "rgba(52,211,153,0.9)" }}>{analogy.result}</span>
          </div>
          <div style={{ color: "var(--color-text-muted)" }}>{analogy.desc}</div>
        </div>
      )}

      {/* 原理说明 */}
      <div className="p-4 rounded-xl border text-xs leading-relaxed space-y-2" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}>
        <p>
          <strong style={{ color: "var(--color-text)" }}>词向量（Word Embedding）：</strong>
          将词汇映射到高维稠密向量（实际通常 256~4096 维），意义相近的词在向量空间中距离更近。
          大模型的 Embedding 层本质是一个巨大的查找表。
        </p>
        <p>
          <strong style={{ color: "var(--color-text)" }}>语义类比的线性结构：</strong>
          Word2Vec 发现的惊人性质 — 词向量支持算术运算：vec("king") − vec("man") + vec("woman") ≈ vec("queen")，
          说明模型在向量空间中编码了结构化的语义关系。
        </p>
      </div>
    </div>
  );
}
