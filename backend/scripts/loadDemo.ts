import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type DemoBookmark = {
  title: string;
  url: string;
  description: string;
  folder: string;
  tags: string[];
  visitCount: number;
  lastVisitedAt?: string;
};

const tagConfigs = [
  { name: '前端', color: '#0ea5e9' },
  { name: '后端', color: '#f97316' },
  { name: 'DevOps', color: '#22c55e' },
  { name: 'AI', color: '#a855f7' },
  { name: '效率', color: '#facc15' },
  { name: '设计', color: '#ec4899' },
  { name: '产品', color: '#6366f1' },
  { name: '社区', color: '#14b8a6' },
  { name: '文档', color: '#0284c7' },
  { name: '资讯', color: '#f97316' },
  { name: '中文', color: '#f43f5e' },
  { name: '英文', color: '#475569' },
];

const folderStructure = [
  { name: '开发与运维', children: ['前端工具', '后端服务', '运维工具'] },
  { name: 'AI 与自动化', children: ['模型平台', '效率应用'] },
  { name: '产品与设计', children: ['灵感画廊', '设计系统'] },
  { name: '学习与社区', children: ['技术社区', '知识沉淀'] },
  { name: '效率与资讯', children: ['效率工具', '行业资讯'] },
];

const demoBookmarks: DemoBookmark[] = [
  {
    title: 'GitHub',
    url: 'https://github.com',
    description: '全球最大的开源托管平台，追踪代码、Issue 与 Release 的必备站点。',
    folder: '前端工具',
    tags: ['前端', '后端', '社区', '英文'],
    visitCount: 420,
    lastVisitedAt: '2024-06-18T10:10:00Z',
  },
  {
    title: 'Stack Overflow',
    url: 'https://stackoverflow.com',
    description: '工程师问答社区，快速检索各种调试经验与最佳实践。',
    folder: '技术社区',
    tags: ['后端', '社区', '英文'],
    visitCount: 305,
    lastVisitedAt: '2024-06-15T02:32:00Z',
  },
  {
    title: 'MDN Web Docs',
    url: 'https://developer.mozilla.org',
    description: 'Mozilla 提供的权威 Web 文档，涵盖 HTML、CSS、JavaScript 标准。',
    folder: '知识沉淀',
    tags: ['前端', '文档', '英文'],
    visitCount: 512,
    lastVisitedAt: '2024-06-20T08:45:00Z',
  },
  {
    title: 'CSS-Tricks',
    url: 'https://css-tricks.com',
    description: '丰富的 CSS 与前端工程技巧集合，常见布局和动画都有示例。',
    folder: '前端工具',
    tags: ['前端', '文档', '英文'],
    visitCount: 188,
    lastVisitedAt: '2024-06-12T05:20:00Z',
  },
  {
    title: 'Tailwind CSS Docs',
    url: 'https://tailwindcss.com/docs',
    description: '实用原子化 CSS 框架文档，查找 class 即可应用到项目中。',
    folder: '前端工具',
    tags: ['前端', '文档', '英文'],
    visitCount: 276,
    lastVisitedAt: '2024-06-19T01:18:00Z',
  },
  {
    title: 'React 文档',
    url: 'https://react.dev',
    description: 'React 官方新版文档，提供学习路线与交互式示例。',
    folder: '前端工具',
    tags: ['前端', '文档', '英文'],
    visitCount: 333,
    lastVisitedAt: '2024-06-17T07:05:00Z',
  },
  {
    title: 'Vite 官方文档',
    url: 'https://vitejs.dev',
    description: '新一代前端构建工具，具备超快 HMR 与多框架支持。',
    folder: '前端工具',
    tags: ['前端', '文档', '英文'],
    visitCount: 210,
    lastVisitedAt: '2024-06-16T10:42:00Z',
  },
  {
    title: 'Node.js 文档',
    url: 'https://nodejs.org/en/docs',
    description: 'Node.js 官方文档，涵盖 API、指南与版本发布说明。',
    folder: '后端服务',
    tags: ['后端', '文档', '英文'],
    visitCount: 190,
    lastVisitedAt: '2024-06-10T11:30:00Z',
  },
  {
    title: 'Prisma Docs',
    url: 'https://www.prisma.io/docs',
    description: '现代化 ORM 的参考文档，包括 schema、迁移与最佳实践。',
    folder: '后端服务',
    tags: ['后端', '文档', '英文'],
    visitCount: 165,
    lastVisitedAt: '2024-06-11T04:55:00Z',
  },
  {
    title: 'Docker Docs',
    url: 'https://docs.docker.com',
    description: '容器化入门必读，包含镜像、Compose、Registry 等专题。',
    folder: '运维工具',
    tags: ['DevOps', '文档', '英文'],
    visitCount: 298,
    lastVisitedAt: '2024-06-14T09:12:00Z',
  },
  {
    title: 'Kubernetes 文档',
    url: 'https://kubernetes.io/docs',
    description: 'K8s 官方教程，覆盖集群运维、控制面、CRD 扩展。',
    folder: '运维工具',
    tags: ['DevOps', '后端', '文档', '英文'],
    visitCount: 254,
    lastVisitedAt: '2024-06-09T13:25:00Z',
  },
  {
    title: 'Terraform Registry',
    url: 'https://registry.terraform.io',
    description: '基础设施即代码模块仓库，查找云资源模板非常方便。',
    folder: '运维工具',
    tags: ['DevOps', '文档', '英文'],
    visitCount: 144,
    lastVisitedAt: '2024-06-13T15:45:00Z',
  },
  {
    title: 'Grafana Labs',
    url: 'https://grafana.com',
    description: '可视化监控与观测平台，Dashboard 模板丰富。',
    folder: '运维工具',
    tags: ['DevOps', '后端', '英文'],
    visitCount: 172,
    lastVisitedAt: '2024-06-08T06:40:00Z',
  },
  {
    title: 'Prometheus Docs',
    url: 'https://prometheus.io/docs',
    description: '时序监控系统，通过 PromQL 可灵活分析指标。',
    folder: '运维工具',
    tags: ['DevOps', '文档', '英文'],
    visitCount: 138,
    lastVisitedAt: '2024-06-07T08:05:00Z',
  },
  {
    title: 'Cloudflare Learning Center',
    url: 'https://www.cloudflare.com/learning',
    description: '快速了解 CDN、安全与网络基础的知识库。',
    folder: '运维工具',
    tags: ['DevOps', '文档', '英文'],
    visitCount: 126,
    lastVisitedAt: '2024-06-05T03:50:00Z',
  },
  {
    title: 'AWS Well-Architected Labs',
    url: 'https://wellarchitectedlabs.com',
    description: 'AWS 官方最佳实践，按支柱拆分优化方案。',
    folder: '运维工具',
    tags: ['DevOps', '后端', '英文'],
    visitCount: 110,
    lastVisitedAt: '2024-06-04T09:15:00Z',
  },
  {
    title: 'Netlify Docs',
    url: 'https://docs.netlify.com',
    description: '静态站点与 Edge Functions 的部署指南。',
    folder: '后端服务',
    tags: ['后端', '文档', '英文'],
    visitCount: 120,
    lastVisitedAt: '2024-06-03T07:28:00Z',
  },
  {
    title: 'Vercel Docs',
    url: 'https://vercel.com/docs',
    description: 'Next.js 官方托管平台文档，含 Edge Runtime 说明。',
    folder: '后端服务',
    tags: ['后端', '文档', '英文'],
    visitCount: 210,
    lastVisitedAt: '2024-06-02T05:12:00Z',
  },
  {
    title: 'Render Platform',
    url: 'https://render.com',
    description: '全托管云服务，适合部署容器、数据库与静态站点。',
    folder: '后端服务',
    tags: ['后端', 'DevOps', '英文'],
    visitCount: 95,
    lastVisitedAt: '2024-05-30T12:40:00Z',
  },
  {
    title: 'Fly.io Guides',
    url: 'https://fly.io/docs',
    description: '全球多区域部署平台，适合分布式应用。',
    folder: '后端服务',
    tags: ['后端', 'DevOps', '英文'],
    visitCount: 84,
    lastVisitedAt: '2024-05-29T04:18:00Z',
  },
  {
    title: 'Notion',
    url: 'https://www.notion.so',
    description: '多合一知识库与项目管理工具，适合搭建团队 Wiki。',
    folder: '效率工具',
    tags: ['效率', '产品', '英文'],
    visitCount: 260,
    lastVisitedAt: '2024-06-18T14:20:00Z',
  },
  {
    title: 'Linear',
    url: 'https://linear.app',
    description: '高效的问题追踪与产品迭代工具，体验极简快速。',
    folder: '效率工具',
    tags: ['效率', '产品', '英文'],
    visitCount: 150,
    lastVisitedAt: '2024-06-17T16:05:00Z',
  },
  {
    title: 'ClickUp',
    url: 'https://clickup.com',
    description: '覆盖任务、白板、文档的全能协同平台。',
    folder: '效率工具',
    tags: ['效率', '产品', '英文'],
    visitCount: 102,
    lastVisitedAt: '2024-06-14T17:32:00Z',
  },
  {
    title: 'Slack',
    url: 'https://slack.com',
    description: '团队沟通与集成机器人平台，支持自动化工作流。',
    folder: '效率工具',
    tags: ['效率', '产品', '英文'],
    visitCount: 240,
    lastVisitedAt: '2024-06-18T11:50:00Z',
  },
  {
    title: 'Trello',
    url: 'https://trello.com',
    description: '看板式任务管理工具，适合轻量项目协作。',
    folder: '效率工具',
    tags: ['效率', '产品', '英文'],
    visitCount: 130,
    lastVisitedAt: '2024-06-12T08:27:00Z',
  },
  {
    title: 'Superhuman',
    url: 'https://superhuman.com',
    description: '专注键盘操作的高效邮箱客户端，适合重度邮件用户。',
    folder: '效率工具',
    tags: ['效率', '英文'],
    visitCount: 76,
    lastVisitedAt: '2024-06-09T03:05:00Z',
  },
  {
    title: 'Figma',
    url: 'https://www.figma.com',
    description: '云端设计协作工具，组件共享与实时协作体验优秀。',
    folder: '设计系统',
    tags: ['设计', '产品', '英文'],
    visitCount: 310,
    lastVisitedAt: '2024-06-18T06:30:00Z',
  },
  {
    title: 'Dribbble',
    url: 'https://dribbble.com',
    description: '设计作品集平台，获取灵感和互动反馈的好地方。',
    folder: '灵感画廊',
    tags: ['设计', '社区', '英文'],
    visitCount: 140,
    lastVisitedAt: '2024-06-15T07:42:00Z',
  },
  {
    title: 'Behance',
    url: 'https://www.behance.net',
    description: 'Adobe 旗下创意社区，展示品牌、UI、插画作品。',
    folder: '灵感画廊',
    tags: ['设计', '社区', '英文'],
    visitCount: 132,
    lastVisitedAt: '2024-06-13T06:55:00Z',
  },
  {
    title: 'Muzli Inspiration',
    url: 'https://muz.li',
    description: '每日设计灵感推送，涵盖产品、网页、插画等领域。',
    folder: '灵感画廊',
    tags: ['设计', '资讯', '英文'],
    visitCount: 98,
    lastVisitedAt: '2024-06-11T05:18:00Z',
  },
  {
    title: 'Product Hunt',
    url: 'https://www.producthunt.com',
    description: '新品发布与早期用户反馈的聚集地，适合关注趋势。',
    folder: '行业资讯',
    tags: ['产品', '资讯', '英文'],
    visitCount: 185,
    lastVisitedAt: '2024-06-19T09:45:00Z',
  },
  {
    title: 'Indie Hackers',
    url: 'https://www.indiehackers.com',
    description: '独立开发者与小型 SaaS 创业社区，分享真实经验。',
    folder: '技术社区',
    tags: ['社区', '产品', '英文'],
    visitCount: 120,
    lastVisitedAt: '2024-06-17T12:55:00Z',
  },
  {
    title: 'Hacker News',
    url: 'https://news.ycombinator.com',
    description: 'Y Combinator 旗下技术与创业资讯站，信息密度高。',
    folder: '行业资讯',
    tags: ['资讯', '社区', '英文'],
    visitCount: 260,
    lastVisitedAt: '2024-06-18T03:03:00Z',
  },
  {
    title: 'Lobsters',
    url: 'https://lobste.rs',
    description: '半私密的技术讨论社区，强调高质量内容。',
    folder: '技术社区',
    tags: ['社区', '资讯', '英文'],
    visitCount: 74,
    lastVisitedAt: '2024-06-16T10:11:00Z',
  },
  {
    title: '掘金',
    url: 'https://juejin.cn',
    description: '中文开发者社区，文章、沸点和小册都很实用。',
    folder: '技术社区',
    tags: ['社区', '中文', '资讯'],
    visitCount: 340,
    lastVisitedAt: '2024-06-18T13:35:00Z',
  },
  {
    title: '少数派',
    url: 'https://sspai.com',
    description: '关注效率工具与数字生活的中文媒体。',
    folder: '行业资讯',
    tags: ['效率', '资讯', '中文'],
    visitCount: 210,
    lastVisitedAt: '2024-06-17T08:08:00Z',
  },
  {
    title: '36氪',
    url: 'https://36kr.com',
    description: '聚焦科技商业与创业资讯的中文媒体。',
    folder: '行业资讯',
    tags: ['资讯', '中文'],
    visitCount: 230,
    lastVisitedAt: '2024-06-16T09:40:00Z',
  },
  {
    title: 'InfoQ 中文站',
    url: 'https://www.infoq.cn',
    description: '软件架构与工程实践的深度报道平台。',
    folder: '行业资讯',
    tags: ['资讯', '中文', '后端'],
    visitCount: 156,
    lastVisitedAt: '2024-06-15T11:12:00Z',
  },
  {
    title: 'SegmentFault',
    url: 'https://segmentfault.com',
    description: '中文技术问答与专栏平台，覆盖前后端领域。',
    folder: '技术社区',
    tags: ['社区', '中文', '前端'],
    visitCount: 182,
    lastVisitedAt: '2024-06-14T12:30:00Z',
  },
  {
    title: '极客时间',
    url: 'https://time.geekbang.org',
    description: '系统化课程平台，覆盖后端、分布式与职业发展。',
    folder: '知识沉淀',
    tags: ['中文', '文档', '后端'],
    visitCount: 205,
    lastVisitedAt: '2024-06-13T13:25:00Z',
  },
  {
    title: 'freeCodeCamp',
    url: 'https://www.freecodecamp.org',
    description: '免费编程课程平台，包含项目练习与证书。',
    folder: '知识沉淀',
    tags: ['前端', '文档', '英文'],
    visitCount: 260,
    lastVisitedAt: '2024-06-12T12:20:00Z',
  },
  {
    title: 'MIT OpenCourseWare',
    url: 'https://ocw.mit.edu',
    description: 'MIT 公开课程，覆盖计算机、数学与工程领域。',
    folder: '知识沉淀',
    tags: ['文档', '英文'],
    visitCount: 150,
    lastVisitedAt: '2024-06-11T10:45:00Z',
  },
  {
    title: 'Coursera',
    url: 'https://www.coursera.org',
    description: '知名在线学习平台，与高校和企业合作开课。',
    folder: '知识沉淀',
    tags: ['文档', '英文'],
    visitCount: 198,
    lastVisitedAt: '2024-06-10T09:10:00Z',
  },
  {
    title: 'DeepSeek',
    url: 'https://www.deepseek.com',
    description: '国产 AI 推理与生成模型平台，支持多语言任务。',
    folder: '模型平台',
    tags: ['AI', '中文', '产品'],
    visitCount: 220,
    lastVisitedAt: '2024-06-20T09:55:00Z',
  },
  {
    title: 'Hugging Face Hub',
    url: 'https://huggingface.co',
    description: '模型与数据集社区，可一键部署推理接口。',
    folder: '模型平台',
    tags: ['AI', '社区', '英文'],
    visitCount: 310,
    lastVisitedAt: '2024-06-19T05:44:00Z',
  },
  {
    title: 'OpenAI Cookbook',
    url: 'https://cookbook.openai.com',
    description: '官方示例库，涵盖 ChatGPT、Function Call 等用法。',
    folder: '模型平台',
    tags: ['AI', '文档', '英文'],
    visitCount: 275,
    lastVisitedAt: '2024-06-18T04:22:00Z',
  },
  {
    title: 'LangChain 文档',
    url: 'https://python.langchain.com',
    description: '多 Agent 与 RAG 编排框架，示例丰富。',
    folder: '模型平台',
    tags: ['AI', '文档', '英文'],
    visitCount: 245,
    lastVisitedAt: '2024-06-17T07:48:00Z',
  },
  {
    title: 'Zapier',
    url: 'https://zapier.com',
    description: '免代码自动化平台，整合数千个 SaaS 的触发器与动作。',
    folder: '效率应用',
    tags: ['效率', '产品', '英文'],
    visitCount: 175,
    lastVisitedAt: '2024-06-16T14:05:00Z',
  },
  {
    title: 'Make (Integromat)',
    url: 'https://www.make.com',
    description: '可视化自动化编排工具，支持复杂数据流。',
    folder: '效率应用',
    tags: ['效率', '产品', '英文'],
    visitCount: 122,
    lastVisitedAt: '2024-06-15T15:55:00Z',
  },
  {
    title: 'Awesome Lists',
    url: 'https://github.com/sindresorhus/awesome',
    description: '社区维护的优秀资源清单合集，涵盖几乎所有技术方向。',
    folder: '知识沉淀',
    tags: ['文档', '社区', '英文'],
    visitCount: 320,
    lastVisitedAt: '2024-06-20T06:05:00Z',
  },
];

async function seedDemoData() {
  console.log('🔄 清空旧数据...');
  await prisma.bookmarkTag.deleteMany();
  await prisma.bookmark.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.folder.deleteMany();

  console.log('🏷️ 创建标签...');
  for (const tag of tagConfigs) {
    await prisma.tag.create({ data: tag });
  }

  console.log('📂 创建文件夹...');
  const folderMap = new Map<string, number>();
  for (const group of folderStructure) {
    const root = await prisma.folder.create({ data: { name: group.name } });
    folderMap.set(group.name, root.id);
    if (group.children) {
      for (const child of group.children) {
        const childFolder = await prisma.folder.create({
          data: { name: child, parentId: root.id },
        });
        folderMap.set(child, childFolder.id);
      }
    }
  }

  console.log('📝 插入书签示例数据...');
  for (const [index, bookmark] of demoBookmarks.entries()) {
    await prisma.bookmark.create({
      data: {
        title: bookmark.title,
        url: bookmark.url,
        description: bookmark.description,
        folderId: folderMap.get(bookmark.folder) ?? null,
        visitCount: bookmark.visitCount,
        lastVisitedAt: bookmark.lastVisitedAt ? new Date(bookmark.lastVisitedAt) : null,
        tags: {
          create: Array.from(
            new Set(bookmark.tags.map(tag => tag.trim()).filter(Boolean))
          ).map(tagName => ({
            tag: {
              connect: { name: tagName },
            },
          })),
        },
      },
    });

    if ((index + 1) % 10 === 0) {
      console.log(`   ➜ 已写入 ${index + 1} 条书签`);
    }
  }

  console.log(`✅ 完成，共写入 ${demoBookmarks.length} 条书签数据。`);
}

seedDemoData()
  .catch(error => {
    console.error('❌ Demo 数据写入失败:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
