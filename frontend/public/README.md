# MarkBook 图标资源

## 已包含的文件

- `favicon.svg` - SVG 格式的网站图标（现代浏览器支持）
- `logo.svg` - 完整的 logo（包含图标和文字）
- `bookmark-icon.svg` - 原始书签图标
- `manifest.json` - PWA 应用配置文件
- `robots.txt` - 搜索引擎爬虫配置

## 需要生成的其他格式图标

由于某些格式需要栅格化处理，建议使用以下在线工具生成：

### 1. 生成 favicon.ico
访问 https://favicon.io/favicon-converter/
- 上传 `favicon.svg`
- 下载生成的 `favicon.ico`
- 放置到 `/public/` 目录

### 2. 生成 PNG 图标
访问 https://realfavicongenerator.net/
- 上传 `favicon.svg`
- 选择所需尺寸：
  - `icon-192.png` (192x192)
  - `icon-512.png` (512x512)
  - `apple-touch-icon.png` (180x180)
  - `og-image.png` (1200x630，用于社交媒体分享)
- 下载并放置到 `/public/` 目录

### 3. 快速命令行生成（需要 ImageMagick）

如果服务器上安装了 ImageMagick，可以使用以下命令：

```bash
# 从 SVG 生成不同尺寸的 PNG
convert -background none favicon.svg -resize 192x192 icon-192.png
convert -background none favicon.svg -resize 512x512 icon-512.png
convert -background none favicon.svg -resize 180x180 apple-touch-icon.png

# 生成 ICO 格式
convert -background none favicon.svg -define icon:auto-resize=64,48,32,16 favicon.ico
```

## Logo 使用说明

### 在 React 组件中使用

```tsx
// 使用 Logo
import logo from '/logo.svg';

<img src={logo} alt="MarkBook" />

// 或直接引用
<img src="/logo.svg" alt="MarkBook" />
```

### 主题色

- 主色调：`#3B82F6` (蓝色)
- 渐变色：`#3B82F6` → `#8B5CF6` (蓝到紫)
- 背景色：`#FFFFFF` (白色)

## 设计说明

Logo 采用双书签图标设计，象征：
- 📚 书签的叠加 = 丰富的收藏
- 💎 渐变色彩 = 现代化、智能化
- ⚡ 简洁设计 = 高效、专业
