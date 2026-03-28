import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdjacentChapters, getAllChapters, getChapterBySlug, getChapterContent, getChapterHeadings } from "@/lib/chapters";
import MarkReadButton from "@/components/MarkReadButton";
import TableOfContents from "@/components/TableOfContents";
import ChapterSidebar from "@/components/ChapterSidebar";
import "highlight.js/styles/github-dark.css";

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
      <div className="flex flex-1 overflow-hidden">
        {/* 左：课程导航 */}
        <ChapterSidebar chapters={allChapters} currentSlug={slug} />

        {/* 中：正文 */}
        <main className="flex-1 overflow-y-auto min-w-0">
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
            className="hidden xl:block shrink-0 border-l overflow-y-auto"
            style={{
              width: 220,
              height: "calc(100vh - 3.5rem)",
              borderColor: "var(--color-border)",
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
