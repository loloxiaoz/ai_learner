import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdjacentChapters, getAllChapters, getChapterBySlug, getChapterQuizContent, getChapterQuizHeadings } from "@/lib/chapters";
import QuizAssessment from "@/components/QuizAssessment";
import ChapterSidebar from "@/components/ChapterSidebar";
import TableOfContents from "@/components/TableOfContents";
import "highlight.js/styles/github.css";

export async function generateStaticParams() {
  return getAllChapters().map((c) => ({ chapter: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ chapter: string }> }) {
  const { chapter: slug } = await params;
  const chapter = getChapterBySlug(slug);
  if (!chapter) return {};
  return { title: `自测 · ${chapter.title} — AI Learner` };
}

export default async function QuizPage({ params }: { params: Promise<{ chapter: string }> }) {
  const { chapter: slug } = await params;
  const chapter = getChapterBySlug(slug);
  if (!chapter) notFound();

  const [htmlContent, quizHeadings] = await Promise.all([
    getChapterQuizContent(slug),
    Promise.resolve(getChapterQuizHeadings(slug)),
  ]);
  const { next } = getAdjacentChapters(slug);
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
          <Link href={`/learn/${slug}`} className="hover:text-white transition-colors">{chapter.title}</Link>
          <span>/</span>
          <span style={{ color: "var(--color-text)" }}>自测</span>
        </div>
        <Link
          href={`/learn/${slug}`}
          className="px-4 py-1.5 rounded-lg text-sm border transition-all hover:bg-white/5"
          style={{ borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}
        >
          ← 回到正文
        </Link>
      </nav>

      {/* 三栏主体 */}
      <div className="flex flex-1">
        {/* 左：课程导航 */}
        <ChapterSidebar chapters={allChapters} currentSlug={slug} />

        {/* 中：自测内容 */}
        <main className="flex-1 min-w-0">
          <div className="max-w-4xl mx-auto px-10 py-12">
            <div className="mb-10">
              <div
                className="inline-flex items-center gap-2 text-xs font-mono px-3 py-1 rounded-full mb-4 border"
                style={{ borderColor: "var(--color-accent)", color: "var(--color-accent)", backgroundColor: "rgba(124, 109, 250, 0.1)" }}
              >
                第 {String(chapter.order).padStart(2, "0")} 章 · 学习检验
              </div>
              <h1 className="text-4xl font-bold" style={{ color: "var(--color-text)" }}>
                {chapter.title}
              </h1>
              <p className="mt-3" style={{ color: "var(--color-text-muted)", fontSize: "1rem" }}>
                以下问题涵盖本章核心知识点，适合面试/答辩场景。建议先自行作答，再查看参考答案。
              </p>
            </div>

            <article
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />

            {/* 自测自评组件 */}
            <QuizAssessment slug={slug} />

            <div className="mt-8 pt-8 border-t flex items-center justify-between" style={{ borderColor: "var(--color-border)" }}>
              <Link
                href={`/learn/${slug}`}
                className="px-5 py-2.5 rounded-lg text-sm border transition-all hover:bg-white/5"
                style={{ borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}
              >
                ← 回到正文
              </Link>
              {next && (
                <Link
                  href={`/learn/${next.slug}`}
                  className="px-5 py-2.5 rounded-lg text-sm font-medium transition-all hover:opacity-90"
                  style={{ backgroundColor: "var(--color-accent)", color: "white" }}
                >
                  下一章：{next.title} →
                </Link>
              )}
            </div>
          </div>
        </main>

        {/* 右：题目目录 */}
        {quizHeadings.length > 0 && (
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
            <TableOfContents headings={quizHeadings} />
          </aside>
        )}
      </div>
    </div>
  );
}
