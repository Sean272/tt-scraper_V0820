# TikTok视频数据采集工具

一个简单的TikTok视频数据采集工具，支持命令行和Web界面。

## 功能特点

- 单个视频信息查询
- 批量视频信息查询
- 作者视频查询（支持天/周/月时间范围）
- 作者粉丝查询
- 视频帧分析
- 批量视频处理
- Web界面支持

## 安装

```bash
# 克隆仓库
git clone https://github.com/Sean272/tt-scraper_V0819.git
cd tt-scraper_V0819

# 安装依赖
npm install
```

## 使用方法

### 单个视频查询
```bash
node examples/show-video-details.js [视频ID]
```

### 作者视频查询
```bash
node examples/user-videos-to-csv.js [作者用户名] [时间范围] [时间单位]

# 示例：获取最近3天的视频
node examples/user-videos-to-csv.js username 3 days

# 示例：获取最近2周的视频
node examples/user-videos-to-csv.js username 2 weeks

# 示例：获取最近1个月的视频
node examples/user-videos-to-csv.js username 1 months
```

### 作者粉丝查询
```bash
node examples/batch-authors-followers.js [作者列表文件]
```

### 批量视频下载
```bash
node examples/batch-video-details-with-download.js [视频ID列表文件]
```

## 数据输出

所有数据都会保存在 `examples/output` 目录下：

- 视频信息：`video_details_[timestamp].csv`
- 作者视频：`[username]_videos.csv`
- 作者粉丝：`authors_followers_[timestamp].csv`

## 注意事项

1. 请合理使用，避免频繁请求
2. 建议使用代理以避免IP限制
