import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI 转型工程师 — 大模型系统学习平台",
  description: "面向工程师的 AI/大模型系统学习路径，内容干货，进度可视化，理解可验证。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
