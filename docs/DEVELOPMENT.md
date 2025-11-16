# 开发指南

## 目录结构约定
- `backend/`：Express + Prisma 分层架构（Routes → Controllers → Services → Repositories）。
- `frontend/`：按 feature 划分（bookmarks/tags/folders/ai），共享组件放在 `src/components`。
- `docs/`：系统说明（当前文件、START、README、PROJECT_SUMMARY、CHECKLIST）。

## 后端规范
1. **分层**：Controller 中禁止直接访问 Prisma；只依赖 Service。Service 只依赖 Repository。
2. **错误处理**：Controller 继承 `BaseController`，统一 `handleSuccess/handleError`。路由使用 `asyncWrapper`。
3. **验证**：所有请求体由 Zod schema 校验（位于 `validators/`）。暴露的 API 必须有对应 schema。
4. **AI 接口**：`aiService` 调用 DeepSeek，需读取 `.env` 中的 `DEEPSEEK_API_KEY`。调用失败返回合理错误信息。
5. **数量限制**：在 Service 层检查标签总量、文件夹层级/数量限制，AI 及批量操作都需复用相同逻辑。
6. **Prisma**：通过 `config/database.ts` 单例获取客户端；禁止在请求中频繁实例化。

## 前端规范
1. **数据获取**：统一使用 `useSuspenseQuery` / `useMutation`，API 客户端封装在 `features/*/api`。
2. **状态管理**：组件内部使用 `useState`/`useReducer`；跨组件数据通过 query cache 或 props。避免额外全局 store。
3. **布局**：桌面优先，不额外为移动端适配。保持固定侧栏（`Sidebar`）宽 288px，顶部工具栏 `sticky top-0`，右侧面板 `sticky top-28`。
4. **样式**：Tailwind + shadcn/ui 组件为主，可辅以 MUI；确保暗色模式兼容（使用 `text-slate-*`、`dark:` 类）。
5. **可访问性**：按钮/链接提供清晰的 aria label（如 AI 面板中“应用全部”）。
6. **AI 交互**：`SmartOrganizePanel` 负责触发/展示，`AiSuggestionDialog` 管理详情。新增功能时保持这两个入口同步。
7. **分页/筛选**：`BookmarkPageCN` 中任何状态更改需重置 `page=1`，并在 `localStorage` 记录排序、视图模式、职业偏好。

## 添加后端端点流程
1. **Schema**：如需，更新 `prisma/schema.prisma` 并运行 `npm run prisma:migrate`。
2. **Validator**：在 `validators/` 声明 Zod schema（create/update 分离）。
3. **Repository**：封装数据库读写。
4. **Service**：组合 Repository，包含业务规则（配额校验、AI 限制等）。
5. **Controller + Route**：Controller 继承 `BaseController`，Route 中注入依赖，使用 `asyncWrapper`。
6. **测试**：通过 Thunder Client/Postman 或前端页面验证；必要时补充单元测试（Vitest/ts-node）。

## 添加前端功能流程
1. **API**：在 `features/<feature>/api` 中添加方法，返回数据使用类型定义（`src/types`）。
2. **组件**：新界面放在 `features/<feature>/components`。如需 Suspense，创建 `ComponentContent` + 包装 `SuspenseLoader`。
3. **状态/上下文**：优先复用现有 hooks（如 `handleQuickCollection`）。新状态使用 `useMemo/useCallback` 优化。
4. **交互一致性**：按钮风格使用 UI 库 `Button`、输入框用 `Input`、下拉使用 `Select`。表格行组件化（参考 `BookmarkTableRow`）。
5. **样式**：保持内容宽度 `max-w-[1400px]`、统一内边距 `px-10 py-10`。表格和卡片使用同类圆角/阴影。
6. **可扩展性**：右侧面板、批量工具条等复用现有 Section 样式，便于未来加入“智能合集”/“Load More”等功能。

## 测试
- **前端**：`cd frontend && npm run test`（Vitest）。主要覆盖 hooks/component 逻辑。
- **后端**：尚未配置自动化测试，推荐使用 `ts-node` + Vitest/ Jest；当前以手动验证为主。
- **构建验证**：`npm run build`（根目录）会执行前端 + 后端 TypeScript build。

## 数据库操作
- **查看/调试**：`cd backend && npm run prisma:studio`。
- **迁移**：`npm run prisma:migrate`；生成 Client 使用 `npm run prisma:generate`。
- **重置**：删除 `backend/prisma/dev.db` 后重新 `npm run prisma:migrate`，注意确保 `.gitignore` 已排除该文件。

## 调试建议
- **后端**：使用 `NODE_OPTIONS=--inspect`; 通过日志输出请求体、响应；AI 调用记录 prompt/response 片段（注意脱敏）。
- **前端**：启用 React DevTools + TanStack Query Devtools；观察 `localStorage`（view mode、sort、profile）是否按预期更新。
- **UI**：在浏览器中检查粘性布局（侧栏/工具栏/右侧面板），确保滚动行为符合预期。

## 部署与构建
1. `cd frontend && npm run build` 生成静态资源。
2. `cd backend && npm run build` 编译 TypeScript。
3. 配置环境变量：
   - `PORT`（默认 3001）
   - `DEEPSEEK_API_KEY`
   - `DATABASE_URL`（生产环境建议使用 PostgreSQL/MySQL）
4. 启动后端：`cd backend && npm run start`，将前端构建产物交给静态服务器（或通过同域代理）。

## 常见问题
| 问题 | 解决方案 |
|------|----------|
| DeepSeek 返回 401 | 检查 `.env` 是否加载、Key 是否正确。 |
| AI 推荐全是旧目录 | 确保职业输入合理、选中的书签多样，并确认后台已启用自动新建逻辑。 |
| 表格选择不同步 | `BookmarkTableRow` 的 `onToggleSelect` 需保持引用稳定，若新增列请同步更新。 |
| dev.db 被 Git 跟踪 | 运行 `git rm --cached backend/prisma/dev.db` 一次，然后提交。 |
| 粘性面板不生效 | 确认布局容器 `xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start` 以及 `aside` 的 `xl:sticky xl:top-28` 类未被覆盖。 |
