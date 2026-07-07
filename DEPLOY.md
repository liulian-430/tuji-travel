# 部署指南

## 方案一：Vercel 部署（推荐，免费）

Vercel 支持全栈部署，前后端都可以托管。

### 前端部署

1. Fork 本项目到你的 GitHub
2. 访问 [vercel.com](https://vercel.com) 用 GitHub 登录
3. 点击 "New Project" → 选择你的仓库
4. 配置：
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. 添加环境变量：
   - `VITE_API_BASE_URL`: 你的后端 API 地址（如部署后端后填写）
6. 点击 "Deploy"

### 后端部署

后端需要单独部署到支持 Node.js 的平台：
- **Railway** (https://railway.app)
- **Render** (https://render.com)
- **Fly.io** (https://fly.io)

## 方案二：GitHub Pages（仅前端静态）

适合快速预览，后端功能需要另行部署。

### 自动部署

项目已配置 GitHub Actions，推送到 main 分支自动部署。

1. 在 GitHub 仓库 Settings → Pages 中：
   - Source 选择 "GitHub Actions"
2. 推送代码到 main/master 分支
3. 等待 Actions 完成，访问 `https://你的用户名.github.io/仓库名/`

### 注意事项

- GitHub Pages 仅支持静态文件
- AI 行程规划、用户系统等需要后端的功能不可用
- 景点数据使用本地 mock 数据

## 方案三：Netlify 部署

1. 访问 [netlify.com](https://www.netlify.com)
2. 选择 "Import an existing project" → 连接 GitHub
3. 选择仓库，配置：
   - Build command: `npm run build`
   - Publish directory: `dist`
4. 点击 "Deploy site"

## 环境变量配置

部署时需要配置以下环境变量：

### 前端环境变量

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `VITE_API_BASE_URL` | 后端 API 地址 | `https://api.example.com` |
| `VITE_USE_MOCK` | 是否使用 mock 数据 | `true` / `false` |

### 后端环境变量

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `DOUBAO_API_KEY` | 豆包大模型 API Key | `ark-xxx` |
| `DOUBAO_MODEL` | 豆包模型名称 | `doubao-seed-evolving` |
| `AMAP_KEY` | 高德地图 API Key | `xxx` |
| `JWT_SECRET` | JWT 密钥 | 随机字符串 |
| `DB_TYPE` | 数据库类型 | `sqlite` / `postgres` |

## 本地开发

```bash
# 安装依赖
npm install

# 启动前端开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

### 后端

```bash
cd backend
npm install

# 启动开发服务器
npm run start:dev

# 构建生产版本
npm run build
npm run start:prod
```
