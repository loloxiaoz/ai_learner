import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeHighlight from "rehype-highlight";
import rehypeStringify from "rehype-stringify";
import { visit } from "unist-util-visit";
import type { Element } from "hast";

const CONTENT_ROOT = path.join(process.cwd(), "../content");
const FILE_CONTENT = "01_正文.md";
const FILE_QUIZ = "02_学习检验.md";

export interface Chapter {
  slug: string;
  title: string;
  dirName: string;
  order: number;
}

export interface AdjacentChapters {
  prev?: Chapter;
  next?: Chapter;
}

export interface Heading {
  id: string;
  text: string;
  level: 2 | 3;
}

const CHAPTER_DIRS = [
  "01_AI基础与发展脉络",
  "02_深度学习核心原理",
  "03_Transformer架构深度解析",
  "04_大语言模型架构演进",
  "05_大模型训练技术",
  "06_大模型微调技术",
  "07_RLHF与对齐技术",
  "08_推理优化与部署",
  "09_RAG与Agent应用",
  "10_前沿趋势与实战总结",
];

// 缓存：CHAPTER_DIRS 是静态数据，只需解析一次
const CHAPTERS: Chapter[] = CHAPTER_DIRS.map((dirName) => {
  const parts = dirName.match(/^(\d+)_(.+)$/);
  if (!parts) throw new Error(`Invalid chapter dir: ${dirName}`);
  return {
    slug: parts[1],
    title: parts[2],
    dirName,
    order: parseInt(parts[1], 10),
  };
});

export function getAllChapters(): Chapter[] {
  return CHAPTERS;
}

export function getChapterBySlug(slug: string): Chapter | undefined {
  return CHAPTERS.find((c) => c.slug === slug);
}

export function getAdjacentChapters(slug: string): AdjacentChapters {
  const idx = CHAPTERS.findIndex((c) => c.slug === slug);
  return {
    prev: idx > 0 ? CHAPTERS[idx - 1] : undefined,
    next: idx < CHAPTERS.length - 1 ? CHAPTERS[idx + 1] : undefined,
  };
}

// 汉字数字映射（支持一~十）
const CN_NUM: Record<string, number> = {
  一: 1, 二: 2, 三: 3, 四: 4, 五: 5,
  六: 6, 七: 7, 八: 8, 九: 9, 十: 10,
};

// 将 Markdown 内相对路径的章节链接重写为网站路由
// rehype 节点中 href 已经是 URL 编码字符串，需要先解码
function resolveChapterLink(rawHref: string): string | null {
  let href: string;
  try {
    href = decodeURIComponent(rawHref);
  } catch {
    href = rawHref;
  }
  const numMatch = href.match(/^\.\.\/(\d+)[_\-]/);
  if (numMatch) return `/learn/${numMatch[1].padStart(2, "0")}`;
  const chMatch = href.match(/^\.\.\/第([一二三四五六七八九十]+)章/);
  if (chMatch) {
    const cn = chMatch[1];
    const num = cn === "十" ? 10 : cn.startsWith("十") ? 10 + (CN_NUM[cn[1]] ?? 0) : (CN_NUM[cn] ?? 0);
    if (num > 0) return `/learn/${String(num).padStart(2, "0")}`;
  }
  if (href === "../README.md" || href.endsWith("/README.md")) return "/learn";
  return null;
}

function slugify(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^\w\u4e00-\u9fff-]/g, "");
}

function rehypeRewritePaths(slug: string) {
  return () => (tree: unknown) => {
    visit(tree as Parameters<typeof visit>[0], "element", (node: Element) => {
      if (node.tagName === "img" && node.properties?.src) {
        const src = String(node.properties.src);
        if (src.startsWith("images/")) {
          node.properties.src = `/images/${slug}/${src.slice("images/".length)}`;
        }
      }
      if (node.tagName === "a" && node.properties?.href) {
        const rewritten = resolveChapterLink(String(node.properties.href));
        if (rewritten) node.properties.href = rewritten;
      }
      if ((node.tagName === "h2" || node.tagName === "h3") && !node.properties?.id) {
        const text = node.children
          .filter((c) => c.type === "text")
          .map((c) => (c as { value: string }).value)
          .join("");
        node.properties = node.properties ?? {};
        node.properties.id = slugify(text);
      }
    });
  };
}

async function markdownToHtml(raw: string, slug: string): Promise<string> {
  const { content } = matter(raw);
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeHighlight)
    .use(rehypeRewritePaths(slug))
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(content);
  return String(result);
}

export async function getChapterContent(slug: string): Promise<string> {
  const chapter = getChapterBySlug(slug);
  if (!chapter) throw new Error(`Chapter not found: ${slug}`);
  const raw = fs.readFileSync(path.join(CONTENT_ROOT, chapter.dirName, FILE_CONTENT), "utf-8");
  return markdownToHtml(raw, slug);
}

export async function getChapterQuizContent(slug: string): Promise<string> {
  const chapter = getChapterBySlug(slug);
  if (!chapter) throw new Error(`Chapter not found: ${slug}`);
  const raw = fs.readFileSync(path.join(CONTENT_ROOT, chapter.dirName, FILE_QUIZ), "utf-8");
  return markdownToHtml(raw, slug);
}

export function getChapterHeadings(slug: string): Heading[] {
  const chapter = getChapterBySlug(slug);
  if (!chapter) return [];
  const raw = fs.readFileSync(path.join(CONTENT_ROOT, chapter.dirName, FILE_CONTENT), "utf-8");
  const { content } = matter(raw);
  const headings: Heading[] = [];
  for (const line of content.split("\n")) {
    const m2 = line.match(/^## (.+)/);
    if (m2) { headings.push({ id: slugify(m2[1]), text: m2[1].trim(), level: 2 }); continue; }
    const m3 = line.match(/^### (.+)/);
    if (m3) { headings.push({ id: slugify(m3[1]), text: m3[1].trim(), level: 3 }); }
  }
  return headings;
}
