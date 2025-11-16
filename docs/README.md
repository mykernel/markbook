# 📚 书签管理系统

桌面优先的全栈书签管理工具，提供固定侧栏、粘性工具栏、访问洞察与 AI 智能整理能力。

## 核心功能
- **书签管理**：添加/编辑/删除，批量删除/移动/批量增删标签，支持 visitCount 和 lastVisitedAt。
- **筛选与排序**：关键词搜索高亮，按收藏时间/访问次数/最近访问排序，常用合集快速入口（最近访问/高频/置顶/AI动作）。
- **标签与文件夹约束**：标签总量 ≤ 50；文件夹两级结构，根目录 ≤ 5、二级 ≤ 20，AI 和手动操作共用校验。
- **AI 整理**：DeepSeek 推荐目录/标签，支持职业偏好，逐条或一键应用，可自动新建符合配额的目录/标签。
- **界面布局**：左侧固定侧栏，顶部工具区粘性（搜索/排序/视图/快捷合集），右侧“访问洞察 + 智能整理 + 快捷操作”粘性面板。默认表格视图，支持卡片查看。

## 技术栈
- **前端**：React 18、TypeScript、Vite、TanStack Router/Query (Suspense)、MUI v7 + Tailwind、Axios。
- **后端**：Node.js 18、Express、TypeScript、Prisma (SQLite)、Zod。
- **AI**：DeepSeek Chat Completion，通过 `/api/ai/organize` 暴露。

## 快速开始
```bash
# 根目录安装依赖
npm install

# 同时启动前后端
npm run dev

# 或分别启动
cd backend && npm run dev   # http://localhost:3001
cd frontend && npm run dev  # http://localhost:3000
```

### 环境变量
- 后端示例：`backend/.env.example`
  - `DEEPSEEK_API_KEY=your-deepseek-api-key`
- 复制为 `backend/.env` 并填入真实 Key。

## API 速览
```
GET  /api/bookmarks                 # 分页/排序列表
GET  /api/bookmarks/search          # 搜索 + 筛选 + 高亮
POST /api/bookmarks                 # 新建
PUT  /api/bookmarks/:id             # 更新
DELETE /api/bookmarks/:id           # 删除
POST /api/bookmarks/:id/visit       # 记录访问
POST /api/bookmarks/bulk/actions    # 批量删除/移动/增删标签

GET  /api/tags                      # 标签列表
POST /api/tags                      # 创建/合并
PUT  /api/tags/:id                  # 更新
DELETE /api/tags/:id                # 删除

GET  /api/folders                   # 文件夹列表
POST /api/folders                   # 创建（含层级/数量限制）
PUT  /api/folders/:id               # 更新
DELETE /api/folders/:id             # 删除

POST /api/ai/organize               # AI 整理书签（含职业偏好）
```

## 主要界面元素
- **左侧侧栏**：文件夹/标签筛选、配额提示。
- **顶部粘性工具栏**：搜索、排序、视图切换、常用合集快捷入口，默认折叠摘要。
- **列表区**：表格为默认视图，支持卡片切换；空状态提示清晰。
- **右侧粘性面板**：访问洞察（热门/最近）、智能整理（AI 建议预览与一键应用）、快捷引导。

## 相关文档
- [START.md](START.md) —— 快速启动
- [DEVELOPMENT.md](DEVELOPMENT.md) —— 开发指南
- [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) —— 系统概览
- [CHECKLIST.md](CHECKLIST.md) —— 交付检查列表

## 🔄 开发路线图

### ✅ 已完成
- [x] 书签 CRUD、批量操作、访问统计
- [x] 标签限制 + 自动合并、文件夹两级限制
- [x] 卡片/表格视图切换、Top N 统计卡片
- [x] DeepSeek AI 整理（职业驱动、一键应用）
- [x] 搜索关键词高亮、排序记忆、Sidebar 管理

### 🚧 计划中
- [ ] 导入/导出增强（去重、字段自定义）
- [ ] 标签管理界面（合并/重命名/清理空标签）
- [ ] 暗色模式与主题自定义
- [ ] 拖拽排序、快捷收藏入口
- [ ] 访问趋势仪表盘、更多职业模板

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
