import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdjacentChapters, getAllChapters, getChapterBySlug, getChapterQuizContent } from "@/lib/chapters";
import QuizAssessment from "@/components/QuizAssessment";
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

  const htmlContent = await getChapterQuizContent(slug);
  const { next } = getAdjacentChapters(slug);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-background)" }}>
      <nav className="sticky top-0 z-10 border-b px-6 py-3 flex items-center justify-between" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}>
        <div className="flex items-center gap-2 text-sm" style={{ color: "var(--color-text-muted)" }}>
          <Link href="/" className="hover:text-white transition-colors">AI Learner</Link>
          <span>/</span>
          <Link href="/learn" className="hover:text-white transition-colors">课程</Link>
          <span>/</span>
          <Link href={`/learn/${slug}`} className="hover:text-white transition-colors">{chapter.title}</Link>
          <span>/</span>
          <span style={{ color: "var(--color-text)" }}>自测</span>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-10">
          <div
            className="inline-flex items-center gap-2 text-xs font-mono px-3 py-1 rounded-full mb-4 border"
            style={{ borderColor: "var(--color-accent)", color: "var(--color-accent)", backgroundColor: "rgba(124, 109, 250, 0.1)" }}
          >
            第 {String(chapter.order).padStart(2, "0")} 章 · 学习检验
          </div>
          <h1 className="text-3xl font-bold" style={{ color: "var(--color-text)" }}>
            {chapter.title}
          </h1>
          <p className="mt-3 text-sm" style={{ color: "var(--color-text-muted)" }}>
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
    </div>
  );
}
