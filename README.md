# TikTok视频数据采集与分析工具

一个功能强大的TikTok视频数据采集和分析工具，支持命令行和Web界面操作。

## 功能特点

- 支持单个视频信息查询
- 支持批量作者视频查询
- 支持作者粉丝数据查询
- 支持按时间范围筛选（天/周/月）
- 提供友好的Web操作界面
- 数据导出为CSV格式

## 安装说明

### 环境要求

- Node.js >= 18.0.0
- npm >= 9.0.0

### 安装步骤

1. 克隆项目
```bash
git clone https://github.com/Sean272/tt-scraper_V0819.git
cd tt-scraper_V0819
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

## 使用说明

### 命令行使用

1. 查询单个视频信息
```bash
node examples/show-video-details.js <视频ID>
```

2. 查询作者视频列表
```bash
node examples/user-videos-to-csv.js <作者名> <时间范围> <时间单位>
# 例如：查询最近5天的视频
node examples/user-videos-to-csv.js aitimemorphs 5 days
```

3. 查询作者粉丝信息
```bash
node examples/batch-authors-followers.js <作者名>
```

### Web界面使用

1. 启动Web服务
```bash
cd tiktok-web-scraper
npm run dev
```

2. 打开浏览器访问 http://localhost:3000

3. Web界面功能
   - 单个视频查询：输入视频ID即可查询
   - 作者视频查询：输入作者名和时间范围
   - 批量作者查询：上传作者列表文件（.txt格式）
   - 作者粉丝查询：输入作者名即可查询

### 数据输出

- 所有数据默认保存在 examples/output 目录
- CSV文件包含完整的视频信息
- 支持导出以下字段：
  - 视频ID
  - 描述
  - 作者
  - 点赞数
  - 播放量
  - 创建时间

## 注意事项

1. 批量查询时建议使用合理的时间范围，避免请求过于频繁
2. 数据文件会保存在本地，注意定期清理
3. 建议在使用Web界面时先测试单个查询，确保功能正常

## 常见问题

1. 如果遇到模块导入错误，确保项目根目录的 package.json 中包含 `"type": "module"`
2. 如果Web界面无法启动，检查端口3000是否被占用
3. 如果数据查询失败，可能是网络问题或者用户名不存在

## 更新日志

### v1.0.0
- 完善Web界面功能
- 修复CSV解析问题
- 优化视频链接格式
- 改进错误处理
- 更新依赖版本