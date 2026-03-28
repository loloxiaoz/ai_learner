# CLAUDE.md

本文件为 Claude Code 提供项目工作指南。所有回复和文档内容使用**中文**。

---

## 项目概述

面向在校学生和软件工程师的 AI/大模型免费开源学习平台，共 10 章内容，覆盖从深度学习基础到大模型前沿趋势。核心主张：**内容有深度、进度可视化、理解可验证**。

- 目标用户：准备求职/晋升的学生与工程师
- 商业模式：完全免费开源（CC BY-SA 4.0）
- 部署方式：Vercel（连接 GitHub 自动 CI/CD）

---

## 目录结构

```
ai_learner/
├── content/                        # 课程内容（Markdown + 图片）
│   ├── 01_AI基础与发展脉络/
│   │   ├── 01_正文.md
│   │   ├── 02_学习检验.md
│   │   └── images/
│   ├── 02_深度学习核心原理/
│   ├── 03_Transformer架构深度解析/
│   ├── 04_大语言模型架构演进/
│   ├── 05_大模型训练技术/
│   ├── 06_大模型微调技术/
│   ├── 07_RLHF与对齐技术/
│   ├── 08_推理优化与部署/
│   ├── 09_RAG与Agent应用/
│   └── 10_前沿趋势与实战总结/
├── web/                            # Next.js 15 网站
│   ├── src/
│   │   ├── app/                    # App Router 页面
│   │   │   ├── page.tsx            # 首页
│   │   │   ├── learn/page.tsx      # 课程总览（进度看板 + Tag 云）
│   │   │   ├── learn/[chapter]/page.tsx       # 章节正文
│   │   │   ├── learn/[chapter]/quiz/page.tsx  # 章节自测
│   │   │   ├── visualize/page.tsx             # 可视化专区入口
│   │   │   └── visualize/attention/page.tsx   # 注意力热图动画
│   │   ├── components/
│   │   │   ├── LearnDashboard.tsx  # 课程总览主体（进度条列表）
│   │   │   ├── TagCloud.tsx        # 知识点掌握度 Tag 云
│   │   │   ├── AttentionVisualizer.tsx  # 自注意力热图交互组件
│   │   │   ├── QuizAssessment.tsx  # 自测自评组件（存 localStorage）
│   │   │   └── MarkReadButton.tsx  # 标记已读按钮
│   │   └── lib/
│   │       ├── chapters.ts         # 内容读取、Markdown 转 HTML、链接重写
│   │       ├── progress.ts         # localStorage 进度系统
│   │       ├── useProgressSync.ts  # 跨组件进度同步 Hook
│   │       ├── tags.ts             # 70+ 知识点 Tag 定义（含章节归属、权重）
│   │       └── attentionData.ts    # 预计算注意力权重数据
│   ├── public/images/{01-10}/      # 各章节图片（从 content/ 复制而来）
│   ├── next.config.ts
│   ├── postcss.config.mjs          # Tailwind v4 必须用 @tailwindcss/postcss
│   ├── tailwind.config.ts
│   └── package.json
├── Makefile                        # 一键启动/部署命令
├── SPEC.md                         # 产品需求文档
├── CLAUDE.md                       # 本文件
└── LICENSE                         # CC BY-SA 4.0
```

---

## 技术栈

| 层 | 选型 | 关键点 |
|----|------|--------|
| 框架 | Next.js 15 App Router | SSG（generateStaticParams），章节页静态生成 |
| 样式 | Tailwind CSS v4 | PostCSS 插件为 `@tailwindcss/postcss`（非 v3 的 `tailwindcss`） |
| Markdown | unified + remark + rehype | remark-gfm → remark-rehype → rehype-highlight → rehype-stringify |
| 状态持久化 | localStorage | 无后端，进度本地存储，`progress_updated` 自定义事件跨组件同步 |
| 部署 | Vercel | `make deploy` 一键发布 |

---

## 常见开发命令

```bash
make dev       # 启动开发服务器（自动安装依赖）http://localhost:3000
make build     # 生产构建
make deploy    # 部署到 Vercel
make clean     # 删除 node_modules 和 .next
```

---

## 关键实现细节

### Markdown → HTML 渲染管线

`web/src/lib/chapters.ts` 中的 `getChapterContent()` / `getChapterQuizContent()`：

1. 读取 `content/XX_章节/01_正文.md`
2. unified 管线：`remark-parse → remark-gfm → remark-rehype → rehype-highlight → rehype-stringify`
3. 自定义 rehype 插件 `rehypeRewritePaths()` 在同一次 tree traversal 中处理：
   - **图片**：`images/xxx.png` → `/images/{slug}/xxx.png`（对应 `public/images/{slug}/`）
   - **章节链接**：`../XX_章节名/01_正文.md` → `/learn/{slug}`
4. 链接重写需要 `decodeURIComponent()`（rehype 会 URL 编码中文路径），以及中文数字映射表（一→1，二→2，…，十→10）

### 进度系统

- 数据结构：`ProgressData { chapters: Record<slug, { read, mastery: 0~4 }> }`
- 存储：`localStorage["ai_learner_progress"]`
- 跨组件同步：`useProgressSync(onSync)` hook 同时监听 `storage`（跨 Tab）和 `progress_updated`（同 Tab）事件

### 静态图片资源

章节 Markdown 中的相对图片路径（`images/xxx.png`）需要对应的静态文件存在于 `web/public/images/{slug}/xxx.png`。新增章节图片时需手动同步。

---

## 内容编写规范

### 正文文件（01_正文.md）
- 面向初学者和有一定基础的读者
- 包含：学习目标、核心概念、原理解释、对比表格、示意图
- 语言通俗易懂，配合代码块和图表
- 提供延伸阅读资源（论文、教程链接）

### 学习检验文件（02_学习检验.md）
- 包含 10 个以上经典面试/答辩问题
- 每题配有详细参考答案（要点拆解 + 对比表格 + 加分点提示）
- 提供自测评分标准和面试技巧

---

## P1 / P2 待办功能

**P1（体验提升）**
- 移动端适配
- 暗色/亮色主题切换
- 章节全文搜索

**P2（内容扩展）**
- 更多交互动画（反向传播、RAG 全流程）
- 进度云端同步（需要后端）
- AI 面试官模拟对话
