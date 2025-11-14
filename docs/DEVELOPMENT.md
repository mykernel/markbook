# 开发指南

## 代码规范

### 后端开发规范

遵循 `backend-dev-guidelines` 技能指南：

1. **分层架构**
   - Routes: 仅路由定义
   - Controllers: 继承 BaseController，处理 HTTP 请求
   - Services: 业务逻辑
   - Repositories: 数据访问

2. **错误处理**
   - 所有控制器方法使用 try-catch
   - 使用 BaseController 的错误处理方法
   - 统一的 API 响应格式

3. **验证**
   - 使用 Zod 验证所有输入
   - 在 `validators/` 目录定义 schema

4. **依赖注入**
   - 在路由文件中手动注入依赖
   - Service 依赖 Repository
   - Controller 依赖 Service

### 前端开发规范

遵循 `frontend-dev-guidelines` 技能指南：

1. **组件模式**
   - 使用 `React.FC<Props>` 类型
   - 功能组件放在 `features/` 目录
   - 共享组件放在 `components/` 目录

2. **数据获取**
   - 使用 `useSuspenseQuery` 获取数据
   - API 调用封装在 `features/{feature}/api/` 中
   - 使用 Suspense 边界处理加载状态

3. **路由**
   - 使用 TanStack Router 文件系统路由
   - 页面组件懒加载
   - 路由文件放在 `routes/` 目录

4. **样式**
   - 使用 MUI v7 组件
   - `sx` prop 进行样式定制
   - 响应式设计使用 Grid size prop

## 添加新功能

### 添加新的 API 端点

1. **定义数据模型**（如需要）
```prisma
// backend/prisma/schema.prisma
model NewFeature {
  id        Int      @id @default(autoincrement())
  name      String
  createdAt DateTime @default(now())
}
```

2. **创建 Validator**
```typescript
// backend/src/validators/newFeatureValidator.ts
import { z } from 'zod';

export const createNewFeatureSchema = z.object({
  name: z.string().min(1).max(255),
});
```

3. **创建 Repository**
```typescript
// backend/src/repositories/NewFeatureRepository.ts
import { prisma } from '../config/database';

export class NewFeatureRepository {
  async findAll() {
    return prisma.newFeature.findMany();
  }
  // ... CRUD methods
}
```

4. **创建 Service**
```typescript
// backend/src/services/newFeatureService.ts
import { NewFeatureRepository } from '../repositories/NewFeatureRepository';

export class NewFeatureService {
  constructor(private repo: NewFeatureRepository) {}

  async getAll() {
    return this.repo.findAll();
  }
  // ... business logic
}
```

5. **创建 Controller**
```typescript
// backend/src/controllers/NewFeatureController.ts
import { BaseController } from '../utils/BaseController';

export class NewFeatureController extends BaseController {
  constructor(private service: NewFeatureService) {
    super();
  }

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const data = await this.service.getAll();
      this.handleSuccess(res, data);
    } catch (error) {
      this.handleError(error, res, 'NewFeatureController.getAll');
    }
  }
}
```

6. **定义 Routes**
```typescript
// backend/src/routes/newFeatureRoutes.ts
import { Router } from 'express';
import { NewFeatureController } from '../controllers/NewFeatureController';
import { asyncWrapper } from '../middleware/errorHandler';

const router = Router();
const controller = new NewFeatureController(/* DI */);

router.get('/', asyncWrapper((req, res) => controller.getAll(req, res)));

export default router;
```

7. **注册路由**
```typescript
// backend/src/app.ts
import newFeatureRoutes from './routes/newFeatureRoutes';

app.use('/api/new-feature', newFeatureRoutes);
```

### 添加新的前端功能

1. **创建 API 客户端**
```typescript
// frontend/src/features/new-feature/api/newFeatureApi.ts
import { apiClient } from '@/lib/apiClient';

export const newFeatureApi = {
  getAll: async () => {
    const response = await apiClient.get('/new-feature');
    return response.data.data;
  },
};
```

2. **创建组件**
```typescript
// frontend/src/features/new-feature/components/NewFeatureList.tsx
import React from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { newFeatureApi } from '../api/newFeatureApi';
import { SuspenseLoader } from '~components/SuspenseLoader/SuspenseLoader';

const NewFeatureListContent: React.FC = () => {
  const { data } = useSuspenseQuery({
    queryKey: ['new-feature'],
    queryFn: () => newFeatureApi.getAll(),
  });

  return <div>{/* render data */}</div>;
};

const NewFeatureList: React.FC = () => (
  <SuspenseLoader>
    <NewFeatureListContent />
  </SuspenseLoader>
);

export default NewFeatureList;
```

3. **创建路由**
```typescript
// frontend/src/routes/new-feature/index.tsx
import { createFileRoute } from '@tanstack/react-router';
import { lazy } from 'react';

const NewFeatureList = lazy(() => import('@/features/new-feature/components/NewFeatureList'));

export const Route = createFileRoute('/new-feature/')({
  component: () => <NewFeatureList />,
});
```

## 测试

### 后端测试

```bash
cd backend
# TODO: 添加测试框架
npm test
```

### 前端测试

```bash
cd frontend
# TODO: 添加测试框架
npm test
```

## 数据库操作

### 修改数据库结构

1. 编辑 `backend/prisma/schema.prisma`
2. 运行迁移：
```bash
cd backend
npm run prisma:migrate
```

### 查看数据

```bash
cd backend
npm run prisma:studio
```

## 调试技巧

### 后端调试
- 使用 `console.log` 或调试器
- 检查 API 响应格式
- 使用 Postman/Thunder Client 测试端点

### 前端调试
- React DevTools
- TanStack Query DevTools（可添加）
- Network 面板查看 API 调用

## 性能优化

### 后端
- 数据库索引优化
- 分页查询大数据集
- 缓存常用查询结果

### 前端
- 使用 `useMemo` 缓存计算
- 使用 `useCallback` 优化回调
- 懒加载非关键组件
- 图片懒加载

## 部署

### 生产构建

```bash
# 构建前端
cd frontend
npm run build

# 构建后端
cd backend
npm run build
```

### 环境变量

生产环境需要配置：
- `DATABASE_URL`: 数据库连接
- `PORT`: 后端端口
- `NODE_ENV=production`

## 常见问题

### Q: 如何重置数据库？
A: 删除 `backend/prisma/dev.db` 并重新运行 `npm run prisma:migrate`

### Q: 前端如何调用新的 API？
A: 在对应 feature 的 `api/` 目录添加 API 方法，使用 `apiClient`

### Q: 如何添加新的验证规则？
A: 在 `backend/src/validators/` 目录创建 Zod schema

### Q: 组件应该放在哪里？
A: 功能特定的放 `features/`，通用的放 `components/`
