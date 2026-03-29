import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdjacentChapters, getAllChapters, getChapterBySlug, getChapterContent, getChapterHeadings } from "@/lib/chapters";
import MarkReadButton from "@/components/MarkReadButton";
import TableOfContents from "@/components/TableOfContents";
import ChapterSidebar from "@/components/ChapterSidebar";
import "highlight.js/styles/github.css";

export async function generateStaticParams() {
  return getAllChapters().map((c) => ({ chapter: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ chapter: string }> }) {
  const { chapter: slug } = await params;
  const chapter = getChapterBySlug(slug);
  if (!chapter) return {};
  return { title: `第 ${chapter.order} 章 · ${chapter.title} — AI Learner` };
}

export default async function ChapterPage({ params }: { params: Promise<{ chapter: string }> }) {
  const { chapter: slug } = await params;
  const chapter = getChapterBySlug(slug);
  if (!chapter) notFound();

  const [htmlContent, headings] = await Promise.all([
    getChapterContent(slug),
    Promise.resolve(getChapterHeadings(slug)),
  ]);
  const { prev, next } = getAdjacentChapters(slug);
  const allChapters = getAllChapters();

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--color-background)" }}>
      {/* 顶部导航栏 */}
      <nav
        className="sticky top-0 z-20 border-b px-6 py-3 flex items-center justify-between shrink-0"
        style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)", height: "3.5rem" }}
      >
        <div className="flex items-center gap-2 text-sm" style={{ color: "var(--color-text-muted)" }}>
          <Link href="/" className="hover:text-white transition-colors">AI Learner</Link>
          <span>/</span>
          <Link href="/learn" className="hover:text-white transition-colors">课程</Link>
          <span>/</span>
          <span style={{ color: "var(--color-text)" }}>
            {String(chapter.order).padStart(2, "0")} · {chapter.title}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <MarkReadButton slug={slug} />
          <Link
            href={`/learn/${slug}/quiz`}
            className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all hover:opacity-90"
            style={{ backgroundColor: "var(--color-accent)", color: "white" }}
          >
            开始自测 →
          </Link>
        </div>
      </nav>

      {/* 三栏主体 */}
      <div className="flex flex-1">
        {/* 左：课程导航 */}
        <ChapterSidebar chapters={allChapters} currentSlug={slug} />

        {/* 中：正文 */}
        <main className="flex-1 min-w-0">
          <div className="max-w-4xl mx-auto px-10 py-12">
            <div className="mb-10">
              <div className="text-sm font-mono mb-3" style={{ color: "var(--color-accent)" }}>
                第 {String(chapter.order).padStart(2, "0")} 章
              </div>
              <h1 className="text-4xl font-bold" style={{ color: "var(--color-text)" }}>
                {chapter.title}
              </h1>
            </div>

            <article
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />

            {/* 章节配套可视化入口 */}
            {slug === "02" && (
              <div className="mt-10 space-y-3">
                <div className="text-xs font-medium mb-1" style={{ color: "var(--color-text-muted)" }}>配套交互可视化</div>
                {[
                  { href: "/visualize/backprop", icon: "⟳", title: "反向传播梯度流动", desc: "逐步演示前向传播 → 损失计算 → 链式求导 → 权重更新" },
                  { href: "/visualize/optimizer", icon: "◈", title: "梯度下降优化器对比", desc: "在 2D 损失曲面上对比 SGD / Momentum / RMSProp / Adam 收敛轨迹" },
                  { href: "/visualize/activation", icon: "ƒ", title: "激活函数与梯度消失", desc: "对比 Sigmoid / ReLU / GELU 函数曲线及导数，直观理解梯度消失" },
                ].map(({ href, icon, title, desc }) => (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center gap-4 p-4 rounded-xl border transition-all hover:border-purple-500/50 hover:bg-white/[0.02] group"
                    style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
                  >
                    <div className="text-xl shrink-0" style={{ color: "var(--color-accent)" }}>{icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm" style={{ color: "var(--color-text)" }}>{title}</div>
                      <div className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>{desc}</div>
                    </div>
                    <span className="text-sm opacity-0 group-hover:opacity-100 transition-opacity shrink-0" style={{ color: "var(--color-accent)" }}>进入 →</span>
                  </Link>
                ))}
              </div>
            )}
            {slug === "03" && (
              <div className="mt-10 space-y-3">
                <div className="text-xs font-medium mb-1" style={{ color: "var(--color-text-muted)" }}>配套交互可视化</div>
                {[
                  { href: "/visualize/attention", icon: "◎", title: "Transformer 自注意力机制", desc: "悬停探索注意力热图，切换多头视角，感受 Q/K/V 如何捕捉语言依存关系" },
                  { href: "/visualize/positional-encoding", icon: "≋", title: "位置编码热图", desc: "点击热图格子查看 sin/cos 编码数值，切换曲线模式观察不同频率维度" },
                  { href: "/visualize/transformer-flow", icon: "↕", title: "Transformer 完整数据流", desc: "逐层点击展示 Token 从 Embedding 到输出 Logits 的前向传播完整路径" },
                ].map(({ href, icon, title, desc }) => (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center gap-4 p-4 rounded-xl border transition-all hover:border-purple-500/50 hover:bg-white/[0.02] group"
                    style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
                  >
                    <div className="text-xl shrink-0" style={{ color: "var(--color-accent)" }}>{icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm" style={{ color: "var(--color-text)" }}>{title}</div>
                      <div className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>{desc}</div>
                    </div>
                    <span className="text-sm opacity-0 group-hover:opacity-100 transition-opacity shrink-0" style={{ color: "var(--color-accent)" }}>进入 →</span>
                  </Link>
                ))}
              </div>
            )}
            {slug === "04" && (
              <div className="mt-10 space-y-3">
                <div className="text-xs font-medium mb-1" style={{ color: "var(--color-text-muted)" }}>配套交互可视化</div>
                {[
                  { href: "/visualize/tokenizer", icon: "⌁", title: "BPE 分词过程", desc: "逐步演示字符对合并操作，观察子词词表如何从字符级一步步构建" },
                  { href: "/visualize/word-embedding", icon: "✦", title: "词向量语义空间", desc: "2D 语义聚类散点图，演示 king−man+woman=queen 向量类比运算" },
                ].map(({ href, icon, title, desc }) => (
                  <Link key={href} href={href}
                    className="flex items-center gap-4 p-4 rounded-xl border transition-all hover:border-purple-500/50 hover:bg-white/[0.02] group"
                    style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}>
                    <div className="text-xl shrink-0" style={{ color: "var(--color-accent)" }}>{icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm" style={{ color: "var(--color-text)" }}>{title}</div>
                      <div className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>{desc}</div>
                    </div>
                    <span className="text-sm opacity-0 group-hover:opacity-100 transition-opacity shrink-0" style={{ color: "var(--color-accent)" }}>进入 →</span>
                  </Link>
                ))}
              </div>
            )}
            {slug === "06" && (
              <Link
                href="/visualize/lora"
                className="flex items-center gap-4 mt-10 p-5 rounded-xl border transition-all hover:border-purple-500/50 hover:bg-white/[0.02] group"
                style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
              >
                <div className="text-2xl shrink-0" style={{ color: "var(--color-accent)" }}>⊗</div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs mb-1" style={{ color: "var(--color-text-muted)" }}>配套交互可视化</div>
                  <div className="font-semibold text-sm" style={{ color: "var(--color-text)" }}>LoRA 低秩矩阵分解</div>
                  <div className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                    拖动秩 r 滑块，直观对比参数量节省与矩阵热图，理解低秩分解原理
                  </div>
                </div>
                <span className="text-sm opacity-0 group-hover:opacity-100 transition-opacity shrink-0" style={{ color: "var(--color-accent)" }}>
                  进入可视化 →
                </span>
              </Link>
            )}
            {slug === "07" && (
              <Link
                href="/visualize/rlhf"
                className="flex items-center gap-4 mt-10 p-5 rounded-xl border transition-all hover:border-purple-500/50 hover:bg-white/[0.02] group"
                style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
              >
                <div className="text-2xl shrink-0" style={{ color: "var(--color-accent)" }}>⚖</div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs mb-1" style={{ color: "var(--color-text-muted)" }}>配套交互可视化</div>
                  <div className="font-semibold text-sm" style={{ color: "var(--color-text)" }}>RLHF 三阶段流程</div>
                  <div className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                    逐步演示 SFT → 奖励模型 → PPO 对齐，揭示 ChatGPT 的训练过程
                  </div>
                </div>
                <span className="text-sm opacity-0 group-hover:opacity-100 transition-opacity shrink-0" style={{ color: "var(--color-accent)" }}>
                  进入可视化 →
                </span>
              </Link>
            )}
            {slug === "08" && (
              <div className="mt-10 space-y-3">
                <div className="text-xs font-medium mb-1" style={{ color: "var(--color-text-muted)" }}>配套交互可视化</div>
                {[
                  { href: "/visualize/sampling", icon: "🎲", title: "LLM 采样策略", desc: "实时调整 Temperature / Top-K / Top-P，观察概率分布变化并模拟采样" },
                  { href: "/visualize/kv-cache", icon: "▣", title: "KV Cache 推理加速", desc: "动画对比有无缓存时的计算量，直观理解自回归推理加速原理" },
                  { href: "/visualize/quantization", icon: "▦", title: "模型量化精度对比", desc: "切换 FP32/INT8/INT4，对比权重分布变化与 7B/70B 模型显存占用" },
                ].map(({ href, icon, title, desc }) => (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center gap-4 p-4 rounded-xl border transition-all hover:border-purple-500/50 hover:bg-white/[0.02] group"
                    style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
                  >
                    <div className="text-xl shrink-0" style={{ color: "var(--color-accent)" }}>{icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm" style={{ color: "var(--color-text)" }}>{title}</div>
                      <div className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>{desc}</div>
                    </div>
                    <span className="text-sm opacity-0 group-hover:opacity-100 transition-opacity shrink-0" style={{ color: "var(--color-accent)" }}>进入 →</span>
                  </Link>
                ))}
              </div>
            )}
            {slug === "09" && (
              <Link
                href="/visualize/rag"
                className="flex items-center gap-4 mt-10 p-5 rounded-xl border transition-all hover:border-purple-500/50 hover:bg-white/[0.02] group"
                style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
              >
                <div className="text-2xl shrink-0" style={{ color: "var(--color-accent)" }}>⊞</div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs mb-1" style={{ color: "var(--color-text-muted)" }}>配套交互可视化</div>
                  <div className="font-semibold text-sm" style={{ color: "var(--color-text)" }}>RAG 检索增强生成全流程</div>
                  <div className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                    可视化向量空间语义检索，演示 Embedding → 检索 → 增强 → 生成完整链路
                  </div>
                </div>
                <span className="text-sm opacity-0 group-hover:opacity-100 transition-opacity shrink-0" style={{ color: "var(--color-accent)" }}>
                  进入可视化 →
                </span>
              </Link>
            )}
            {slug === "10" && (
              <Link
                href="/visualize/moe"
                className="flex items-center gap-4 mt-10 p-5 rounded-xl border transition-all hover:border-purple-500/50 hover:bg-white/[0.02] group"
                style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
              >
                <div className="text-2xl shrink-0" style={{ color: "var(--color-accent)" }}>⑃</div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs mb-1" style={{ color: "var(--color-text-muted)" }}>配套交互可视化</div>
                  <div className="font-semibold text-sm" style={{ color: "var(--color-text)" }}>MoE 混合专家路由</div>
                  <div className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                    选择不同 Token 观察路由动态分配，对比稀疏激活与 Dense 模型的参数效率
                  </div>
                </div>
                <span className="text-sm opacity-0 group-hover:opacity-100 transition-opacity shrink-0" style={{ color: "var(--color-accent)" }}>
                  进入可视化 →
                </span>
              </Link>
            )}

            <div className="flex gap-4 mt-16 pt-8 border-t" style={{ borderColor: "var(--color-border)" }}>
              {prev ? (
                <Link
                  href={`/learn/${prev.slug}`}
                  className="flex-1 p-4 rounded-xl border text-left transition-all hover:border-purple-500/40 hover:bg-white/[0.02]"
                  style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
                >
                  <div className="text-xs mb-1" style={{ color: "var(--color-text-muted)" }}>← 上一章</div>
                  <div className="font-medium text-sm" style={{ color: "var(--color-text)" }}>{prev.title}</div>
                </Link>
              ) : <div className="flex-1" />}

              <Link
                href={`/learn/${slug}/quiz`}
                className="flex items-center justify-center px-6 rounded-xl font-medium transition-all hover:opacity-90 text-sm"
                style={{ backgroundColor: "var(--color-accent)", color: "white" }}
              >
                开始自测
              </Link>

              {next ? (
                <Link
                  href={`/learn/${next.slug}`}
                  className="flex-1 p-4 rounded-xl border text-right transition-all hover:border-purple-500/40 hover:bg-white/[0.02]"
                  style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
                >
                  <div className="text-xs mb-1" style={{ color: "var(--color-text-muted)" }}>下一章 →</div>
                  <div className="font-medium text-sm" style={{ color: "var(--color-text)" }}>{next.title}</div>
                </Link>
              ) : <div className="flex-1" />}
            </div>
          </div>
        </main>

        {/* 右：章节内目录 */}
        {headings.length > 0 && (
          <aside
            className="hidden xl:block shrink-0 border-l"
            style={{
              width: 220,
              borderColor: "var(--color-border)",
              position: "sticky",
              top: "3.5rem",
              alignSelf: "flex-start",
              maxHeight: "calc(100vh - 3.5rem)",
              overflowY: "auto",
              padding: "1.5rem 1rem",
            }}
          >
            <TableOfContents headings={headings} />
          </aside>
        )}
      </div>
    </div>
  );
}
