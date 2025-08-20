# TikTok视频数据采集与分析工具

一个功能强大的TikTok视频数据采集和分析工具，支持命令行和Web界面操作。

## 功能特点

### 基础功能
- ✅ 单个视频信息查询
- ✅ 批量视频信息查询
- ✅ 作者视频查询（支持时间范围筛选）
- ✅ 批量作者视频查询
- ✅ 作者粉丝数据查询
- ✅ 批量作者粉丝查询

### 高级功能
- ✅ CapCut视频检测和分析
- ✅ 视频内容AI分析（支持OpenAI和SiliconFlow）
- ✅ 视频帧提取与分析
- ✅ 视频下载功能
- ✅ 数据导出为CSV格式（支持UTF-8编码）
- ✅ 友好的Web操作界面
- ✅ 支持.txt和.csv文件上传

### 时间范围支持
- 天（days）
- 周（weeks）
- 月（months）

## 安装说明

### 环境要求

- Node.js >= 18.0.0
- npm >= 9.0.0
- FFmpeg（用于视频帧提取）

### 安装步骤

1. 克隆项目
```bash
git clone https://github.com/Sean272/tt-scraper_V0820.git
cd tt-scraper_V0820
```

2. 安装主项目依赖
```bash
npm install
```

3. 安装Web界面依赖
```bash
cd tiktok-web-scraper
npm install
```

4. 安装FFmpeg（可选，用于视频分析功能）
```bash
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt update && sudo apt install ffmpeg

# Windows
# 请从 https://ffmpeg.org/download.html 下载并安装
```

## 使用说明

### 命令行使用

#### 1. 查询单个视频信息
```bash
node examples/show-video-details.js <视频ID>

# 示例
node examples/show-video-details.js 7518487669404388630
```

#### 2. 查询作者视频列表
```bash
node examples/user-videos-to-csv.js <作者名> <时间范围> <时间单位> [选项]

# 基本用法
node examples/user-videos-to-csv.js aitimemorphs 5 days

# 跳过CapCut检测（更快）
node examples/user-videos-to-csv.js aitimemorphs 5 days --skip-capcut-check

# 查询更长时间范围
node examples/user-videos-to-csv.js aitimemorphs 2 weeks
node examples/user-videos-to-csv.js aitimemorphs 1 months
```

#### 3. 批量视频信息查询
```bash
node examples/batch-video-details-with-download.js <输入文件> [选项]

# 基本用法（纯文本文件，每行一个视频ID）
node examples/batch-video-details-with-download.js video_ids.txt

# 同时下载视频
node examples/batch-video-details-with-download.js video_ids.txt --download

# 跳过CapCut检测
node examples/batch-video-details-with-download.js video_ids.txt --skip-capcut-check
```

#### 4. 查询作者粉丝信息
```bash
# 单个作者
node examples/batch-authors-followers.js <CSV文件>

# CSV文件格式示例（第一列为用户名）：
# username
# aitimemorphs
# neurosplice
```

#### 5. 视频内容AI分析
```bash
# 使用OpenAI进行内容分析
node examples/batch-video-content-analysis-openai.js <输入文件> <OpenAI_API_Key>

# 使用SiliconFlow进行内容分析
node examples/batch-video-content-analysis-siliconflow.js <输入文件> <SiliconFlow_API_Key>
```

### Web界面使用

1. 启动Web服务
```bash
cd tiktok-web-scraper
npm run dev
```

2. 打开浏览器访问 http://localhost:3000

3. Web界面功能详解

#### 视频信息查询
- **单个视频查询**：输入视频ID即可查询
- **批量视频查询**：上传包含视频ID的文件（.txt或.csv格式）

#### 作者视频查询
- **单个作者查询**：输入作者名、时间范围和时间单位
- **批量作者查询**：
  - 上传作者列表文件（.txt或.csv格式）
  - 设置时间范围（默认7天）
  - 选择时间单位（天/周/月）

#### 作者粉丝查询
- **批量查询**：上传包含作者名的CSV文件

#### 特殊功能
- **数据导出**：所有查询结果支持CSV格式下载
- **中文支持**：完整支持中文显示和UTF-8编码
- **错误处理**：友好的错误提示和状态显示

### 数据输出

#### 输出目录
- 所有数据默认保存在 `examples/output` 目录
- Web界面查询的数据可在线下载

#### CSV文件字段
- 视频ID
- 描述
- 作者信息
- 点赞数、评论数、分享数、播放量
- 创建时间
- 视频链接
- 是否CapCut投稿
- 来源平台代码
- 特效和贴纸信息

#### 作者信息字段
- 用户名、昵称、签名
- 粉丝数、关注数、获赞数
- 作品数
- 认证信息

## 命令行参数说明

### 通用参数
- `--skip-capcut-check`: 跳过CapCut检测，提高查询速度
- `--download`: 同时下载视频文件（仅部分脚本支持）

### 文件格式支持
- **纯文本文件**: 每行一个视频ID或作者名
- **CSV文件**: 包含表头的逗号分隔值文件

### 时间单位
- `days`: 天
- `weeks`: 周  
- `months`: 月

## 注意事项

### 性能优化
1. **使用 `--skip-capcut-check` 参数**可显著提高查询速度
2. 批量查询时建议使用合理的时间范围，避免请求过于频繁
3. 大量数据查询建议分批进行

### 数据管理
1. 数据文件会保存在本地，注意定期清理
2. CSV文件使用UTF-8编码，支持中文字符
3. 所有视频链接直接可访问

### 用户名格式
1. 用户名区分大小写（如：`aitimemorphs` 而不是 `AiTimeMorphs`）
2. 建议先通过单个查询测试用户名是否正确

## 常见问题

### 安装问题
1. **模块导入错误**：确保项目根目录的 package.json 中包含 `"type": "module"`
2. **依赖安装失败**：尝试使用 `npm install --legacy-peer-deps`
3. **FFmpeg未安装**：视频分析功能需要FFmpeg支持

### 运行问题
1. **Web界面无法启动**：检查端口3000是否被占用
2. **数据查询失败**：可能是网络问题或者用户名不存在
3. **CSV解析错误**：确保文件格式正确，使用UTF-8编码

### 性能问题
1. **查询速度慢**：使用 `--skip-capcut-check` 参数
2. **内存占用高**：减少批量查询的数量
3. **网络超时**：检查网络连接，适当增加重试次数

## API配置

### OpenAI集成
```bash
# 设置API密钥
export OPENAI_API_KEY="your_openai_api_key"

# 或在使用时直接传入
node examples/batch-video-content-analysis-openai.js input.csv your_api_key
```

### SiliconFlow集成
```bash
# 设置API密钥
export SILICONFLOW_API_KEY="your_siliconflow_api_key"

# 或在使用时直接传入
node examples/batch-video-content-analysis-siliconflow.js input.csv your_api_key
```

## 更新日志

### v1.2.0 (最新)
- ✅ 新增批量作者视频查询时间范围选择
- ✅ 修复CSV文件BOM字符导致的解析问题
- ✅ 优化用户名大小写敏感问题
- ✅ 改进Web界面用户体验
- ✅ 完善错误处理和提示信息

### v1.1.0
- ✅ 新增CapCut检测功能和 `--skip-capcut-check` 参数
- ✅ 新增视频内容AI分析功能
- ✅ 新增视频下载功能
- ✅ 修复CSV解析和中文编码问题
- ✅ 优化批量查询性能

### v1.0.0
- ✅ 完善Web界面功能
- ✅ 修复CSV解析问题
- ✅ 优化视频链接格式
- ✅ 改进错误处理
- ✅ 更新依赖版本

## 许可证

MIT License

## 贡献

欢迎提交Issue和Pull Request来改进这个项目。

## 联系方式

如有问题或建议，请在GitHub上创建Issue。