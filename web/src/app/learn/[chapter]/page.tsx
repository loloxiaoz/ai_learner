import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdjacentChapters, getAllChapters, getChapterBySlug, getChapterContent } from "@/lib/chapters";
import MarkReadButton from "@/components/MarkReadButton";
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

  const htmlContent = await getChapterContent(slug);
  const { prev, next } = getAdjacentChapters(slug);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-background)" }}>
      <nav className="sticky top-0 z-10 border-b px-6 py-3 flex items-center justify-between" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}>
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

      <div className="max-w-3xl mx-auto px-6 py-12">
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
    </div>
  );
}
