# 📚 Modern Bookmark Management System

> 一个功能完整的全栈书签管理系统，采用现代化技术栈构建

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2-61dafb.svg)](https://reactjs.org/)
[![Express](https://img.shields.io/badge/Express-4.18-green.svg)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748.svg)](https://www.prisma.io/)

## ✨ 特性

### 核心功能
- 📚 **书签管理**: 添加、编辑、删除和组织书签
- 🏷️ **标签系统**: 灵活的多标签分类
- 📁 **文件夹**: 层级化的文件夹结构
- 🔍 **搜索功能**: 全文搜索（待完善）
- 🎨 **现代 UI**: Material-UI v7 组件
- 📱 **响应式设计**: 移动端友好

### 技术特性
- ⚡ **快速开发**: Vite + HMR
- 🔒 **类型安全**: 全栈 TypeScript
- 🎯 **分层架构**: Routes → Controllers → Services → Repositories
- ✅ **输入验证**: Zod schema 验证
- 🔄 **实时更新**: TanStack Query 缓存
- 💾 **本地存储**: SQLite 数据库

## 🚀 快速开始

### 前置要求
- Node.js 18+
- npm 或 yarn

### 安装步骤

```bash
# 1. 克隆项目（或查看当前目录）
cd bookmark

# 2. 安装依赖
npm install

# 3. 启动开发服务器（同时启动前后端）
npm run dev
```

### 分别启动（推荐用于开发）

```bash
# 终端 1 - 后端服务
cd backend
npm run dev
# 运行在 http://localhost:3001

# 终端 2 - 前端应用
cd frontend
npm run dev
# 运行在 http://localhost:3000
```

### 访问应用

- 🌐 前端: http://localhost:3000
- 🔌 后端 API: http://localhost:3001/api
- 💚 健康检查: http://localhost:3001/api/health
- 🗄️ Prisma Studio: `cd backend && npm run prisma:studio`

## 📖 文档

| 文档 | 说明 |
|------|------|
| [START.md](START.md) | 🚀 快速启动指南 |
| [DEVELOPMENT.md](DEVELOPMENT.md) | 🔧 开发指南和规范 |
| [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) | 📊 项目总结和架构 |

## 🎯 技术栈

### 后端
- **运行时**: Node.js 18+
- **框架**: Express 4.18 + TypeScript 5.3
- **数据库**: SQLite + Prisma ORM 5.22
- **验证**: Zod 3.22
- **架构**: 分层架构（Routes → Controllers → Services → Repositories）

### 前端
- **框架**: React 18.2 + TypeScript 5.3
- **构建工具**: Vite 5.0
- **路由**: TanStack Router 1.80
- **数据获取**: TanStack Query 5.59 (Suspense)
- **UI 组件**: Material-UI v7
- **HTTP 客户端**: Axios 1.6

## 📂 项目结构

```
bookmark/
├── backend/              # 后端服务 (Express + Prisma)
│   ├── src/
│   │   ├── config/      # 数据库配置
│   │   ├── controllers/ # 控制器层
│   │   ├── services/    # 业务逻辑层
│   │   ├── repositories/# 数据访问层
│   │   ├── routes/      # 路由定义
│   │   ├── validators/  # Zod 验证
│   │   ├── middleware/  # 中间件
│   │   └── utils/       # 工具类
│   └── prisma/          # 数据库 schema
├── frontend/            # 前端应用 (React + Vite)
│   ├── src/
│   │   ├── features/    # 功能模块
│   │   ├── components/  # 共享组件
│   │   ├── routes/      # 页面路由
│   │   ├── lib/         # API 客户端
│   │   └── types/       # TypeScript 类型
│   └── vite.config.ts
├── .claude/             # Claude Code 技能配置
├── START.md             # 快速启动指南
├── DEVELOPMENT.md       # 开发文档
└── PROJECT_SUMMARY.md   # 项目总结
```

## 🔧 可用命令

### 根目录
```bash
npm run dev              # 同时启动前后端
npm run build            # 构建前后端
npm run dev:backend      # 仅启动后端
npm run dev:frontend     # 仅启动前端
```

### 后端
```bash
cd backend
npm run dev              # 开发模式（热重载）
npm run build            # 构建生产版本
npm run start            # 启动生产版本
npm run prisma:generate  # 生成 Prisma Client
npm run prisma:migrate   # 运行数据库迁移
npm run prisma:studio    # 打开 Prisma Studio
```

### 前端
```bash
cd frontend
npm run dev              # 开发模式
npm run build            # 构建生产版本
npm run preview          # 预览生产版本
```


## 🌐 API 端点

### 书签 (Bookmarks)
```
GET    /api/bookmarks          # 获取所有书签（分页）
GET    /api/bookmarks/search   # 搜索书签
GET    /api/bookmarks/:id      # 获取单个书签
POST   /api/bookmarks          # 创建书签
PUT    /api/bookmarks/:id      # 更新书签
DELETE /api/bookmarks/:id      # 删除书签
```

### 标签 (Tags)
```
GET    /api/tags               # 获取所有标签
POST   /api/tags               # 创建标签
PUT    /api/tags/:id           # 更新标签
DELETE /api/tags/:id           # 删除标签
```

### 文件夹 (Folders)
```
GET    /api/folders            # 获取所有文件夹
GET    /api/folders/roots      # 获取根文件夹
POST   /api/folders            # 创建文件夹
PUT    /api/folders/:id        # 更新文件夹
DELETE /api/folders/:id        # 删除文件夹
```

## 🎨 功能截图

### 书签列表
- 卡片式展示
- 响应式 Grid 布局
- 标签彩色显示
- 文件夹分类

### 添加/编辑书签
- Material-UI 对话框
- 标签自动完成
- 文件夹选择器
- Zod 验证

## 🔄 开发路线图

### ✅ 已完成
- [x] 后端 API 完整实现
- [x] 前端基础界面
- [x] 书签 CRUD 操作
- [x] 标签系统
- [x] 文件夹层级结构
- [x] 响应式设计

### 🚧 计划中
- [ ] 搜索功能完善
- [ ] 侧边栏导航
- [ ] 书签导入导出
- [ ] 暗色模式
- [ ] 拖拽排序
- [ ] 自动获取网站图标

## 🐛 故障排查

### 数据库问题
```bash
cd backend
rm prisma/dev.db
npm run prisma:migrate
```

### 端口冲突
- 修改 `backend/.env` 中的 `PORT`
- 修改 `frontend/vite.config.ts` 中的 `server.port`

### 依赖问题
```bash
rm -rf node_modules package-lock.json
npm install
```

## 🤝 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

MIT License - 详见 LICENSE 文件

## 👨‍💻 作者

开发时间：2025-11-14
技术栈：全栈 TypeScript
架构模式：分层架构

---

**⭐ 如果这个项目对您有帮助，请给个 Star！**
