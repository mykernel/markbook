# 🚀 快速启动指南

## 1. 安装依赖
```bash
cd /root/bookmark
npm install
```

## 2. 配置环境变量
```bash
cp backend/.env.example backend/.env
```
填写 `DEEPSEEK_API_KEY`，用于 AI 整理接口。

## 3. 启动服务
```bash
# 启动后端（http://localhost:3001）
cd backend
npm run dev

# 另一个终端启动前端（http://localhost:3000）
cd frontend
npm run dev
```
或在根目录执行 `npm run dev` 同时启动前后端。

## 4. 常用端点
- `GET http://localhost:3001/api/health`
- `GET http://localhost:3001/api/bookmarks`
- `POST http://localhost:3001/api/ai/organize`
- Prisma Studio：`cd backend && npm run prisma:studio`

## 核心模块速览
- **固定侧栏**：文件夹/标签筛选、配额显示。
- **粘性工具栏**：搜索、排序、视图切换、常用合集入口（最近访问/高频/置顶/AI）。
- **书签列表**：默认表格视图，支持卡片切换、关键词高亮、批量操作条。
- **右侧面板**：访问洞察（热门/最近）、AI 智能整理面板、快捷操作提示。
- **AI 整理**：支持职业输入、自动新建目录/标签（受配额限制）、单条或一键应用建议。

## 项目结构（摘要）
```
backend/  # Express + Prisma + Zod + DeepSeek
frontend/ # React + Vite + TanStack Router/Query + Tailwind + MUI + shadcn/ui
docs/     # 本文档及开发/总结材料
```

## 常见命令
| 位置 | 命令 | 说明 |
|------|------|------|
| 根目录 | `npm run dev` | 同时启动前后端 |
| 根目录 | `npm run build` | 构建前后端 |
| backend | `npm run prisma:migrate` | 运行迁移 |
| backend | `npm run prisma:studio` | 可视化数据库 |
| frontend | `npm run build` | 生成前端产物 |

## 迭代记录（摘要）
| 版本 | 核心改动 |
|------|-----------|
| V1 | 搭建基础 CRUD、批量操作、AI 整理接口。 |
| V2 | 引入固定侧栏、粘性顶部工具栏、访问洞察卡片。 |
| V3 | 新增智能整理侧栏、常用合集快捷入口。 |
| V4 | 重构表格/卡片视图，添加置顶按钮与批量置顶。 |
| V5 | 文档与粘性布局全面更新，确保桌面首屏聚焦书签列表。 |

## 故障排查
- **后端无法启动**：检查 Node.js ≥ 18、端口 3001、`backend/.env` 是否配置。
- **前端 404**：确认 `frontend/.env` 无需配置，API 地址默认指向本地 3001。
- **AI 接口失败**：确认 DeepSeek Key 正确、服务器可访问外网。
1. 确认已安装依赖：`npm install`
2. 检查端口 3000 未被占用
3. 确保后端服务正在运行

### 数据库问题
```bash
cd backend
rm prisma/dev.db  # 删除旧数据库
npm run prisma:migrate  # 重新迁移
```

---

## 📝 下一步开发建议

1. **完善搜索功能**
   - 实现前端搜索逻辑
   - 添加防抖优化

2. **添加侧边栏**
   - 文件夹树形结构
   - 标签筛选面板

3. **导入导出**
   - 支持浏览器书签格式
   - JSON 格式导出

4. **主题系统**
   - 暗色模式支持
   - 主题切换按钮

5. **优化体验**
   - 添加书签预览图
   - 自动获取网站图标
   - 拖拽排序

---

## 📚 参考资料

- [Prisma 文档](https://www.prisma.io/docs)
- [TanStack Router](https://tanstack.com/router)
- [TanStack Query](https://tanstack.com/query)
- [MUI v7](https://mui.com/)
- [React 18](https://react.dev/)

---

## 💡 提示

- 使用 Prisma Studio 查看和编辑数据
- 查看 `README.md` 获取完整文档
- 后端遵循分层架构模式
- 前端采用 Suspense 模式进行数据加载

**祝您开发愉快！** 🎉
