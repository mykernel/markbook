# MarkBook 品牌设计指南

## 📋 概述

MarkBook 是一个现代化的智能书签管理系统，品牌设计体现简洁、高效、智能的特点。

## 🎨 品牌色彩

### 主色调
- **主蓝色**: `#3B82F6` (RGB: 59, 130, 246)
  - 用途：主要按钮、链接、强调元素
  - 含义：信任、专业、效率

- **紫色**: `#8B5CF6` (RGB: 139, 92, 246)
  - 用途：渐变色、特殊强调
  - 含义：创新、智能、现代

### 渐变
```css
background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%);
```

### 辅助色
- **背景白**: `#FFFFFF`
- **文本灰**: `#1F2937`
- **边框灰**: `#E5E7EB`

## 🖼️ Logo 规范

### Logo 文件
- **完整 Logo**: `/frontend/public/logo.svg`
  - 包含图标 + 文字 "MarkBook"
  - 用于网页头部、宣传材料

- **图标**: `/frontend/public/favicon.svg`
  - 纯图标，双书签设计
  - 用于浏览器标签页、应用图标

### 设计理念
- **双书签图标**: 象征丰富的收藏和分类管理
- **蓝紫渐变**: 体现现代化和智能化
- **圆角设计**: 友好、易用

### 使用规范

#### ✅ 正确使用
- 保持 Logo 清晰可见
- 在白色或浅色背景上使用
- 保持原始比例，不拉伸变形
- Logo 周围留有足够空白（最小间距 = Logo 高度的 25%）

#### ❌ 禁止使用
- 不要更改 Logo 颜色
- 不要旋转或倾斜 Logo
- 不要在图案复杂的背景上使用
- 不要添加阴影或特效

## 📱 图标资源

### 网站图标
| 文件名 | 尺寸 | 用途 |
|--------|------|------|
| `favicon.svg` | 矢量 | 现代浏览器标签页图标 |
| `favicon.ico` | 16x16, 32x32, 48x48, 64x64 | 传统浏览器支持 |
| `icon-192.png` | 192x192 | PWA 小图标 |
| `icon-512.png` | 512x512 | PWA 大图标 |
| `apple-touch-icon.png` | 180x180 | iOS 添加到主屏幕 |
| `og-image.png` | 1200x630 | 社交媒体分享图 |

### 在代码中使用

#### React 组件
```tsx
// 使用 Logo
<img src="/logo.svg" alt="MarkBook" className="h-8" />

// 使用图标
<img src="/favicon.svg" alt="MarkBook Icon" className="h-6 w-6" />
```

#### HTML
```html
<!-- 完整 Logo -->
<img src="/logo.svg" alt="MarkBook" height="32">

<!-- 仅图标 -->
<img src="/favicon.svg" alt="Icon" width="24" height="24">
```

## 🎯 品牌应用场景

### 网页应用
- 侧边栏顶部：Logo + 文字
- 浏览器标签：Favicon
- 加载页面：Logo 居中显示

### 移动端
- App 图标：使用 `icon-512.png`
- 启动页：Logo + 文字

### 社交媒体
- 分享卡片：使用 `og-image.png`
- 头像：使用 `icon-512.png`

### 文档和演示
- 标题页：完整 Logo
- 页眉页脚：小尺寸图标

## 🔤 字体规范

### Logo 字体
- 字体：Arial, sans-serif
- 粗细：Bold (700)
- 颜色：渐变色（蓝到紫）

### 正文字体
建议使用系统字体栈：
```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI",
             Roboto, "Helvetica Neue", Arial, sans-serif;
```

## 📝 品牌语调

### 产品描述
- **简短版**: 智能书签管理系统
- **完整版**: MarkBook - 现代化的智能书签管理系统，支持 AI 整理、标签分类和快速搜索

### 关键词
- 智能
- 高效
- 简洁
- 现代化
- 书签管理
- AI 整理

## 🔄 更新日志

### v1.0 (2025-11-16)
- 创建初始品牌设计
- 设计 Logo 和图标系统
- 定义品牌色彩规范
- 生成各尺寸图标资源
