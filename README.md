# TikTok视频数据采集与分析工具

一个强大的TikTok视频数据采集工具，支持批量获取作者视频信息、CapCut检测、内容分析等功能。

## 🌟 主要功能

- ✅ **批量查询作者视频** - 支持多个作者的近期视频批量获取
- ✅ **时间范围过滤** - 支持按天/周/月过滤视频
- ✅ **CapCut检测** - 智能检测视频是否使用CapCut制作
- ✅ **CSV导出** - 自动生成包含详细信息的CSV文件
- ✅ **中文支持** - 完整的中文编码和显示支持
- ✅ **Web界面** - 提供友好的Web操作界面

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 批量查询作者视频

```bash
# 查询最近7天的视频
node examples/batch-authors-videos.js authors.txt 7 days --skip-capcut-check

# 查询最近2周的视频（包含CapCut检测）
node examples/batch-authors-videos.js authors.csv 2 weeks

# 查询最近3个月的视频
node examples/batch-authors-videos.js authors.txt 3 months
```

### 作者文件格式

**纯文本格式（推荐）：**
```
douyin_user1
douyin_user2
douyin_user3
```

**CSV格式：**
```csv
username,备注
douyin_user1,用户1备注
douyin_user2,用户2备注
```

## 📊 输出示例

运行后会生成：

1. **CSV文件** (`examples/output/batch_authors_videos_YYYY-MM-DD.csv`)
   - 视频ID、描述、作者信息
   - 点赞数、评论数、分享数、播放数
   - 创建时间、视频链接
   - CapCut检测结果

2. **统计信息**
   ```
   === 批量获取完成 ===
   ✓ 成功处理: 26 个作者
   ✗ 失败处理: 0 个作者
   📊 总计获取: 153 个视频信息
   ```

## 🛠️ 其他功能

### 单个作者视频查询
```bash
node examples/user-videos-to-csv.js <用户名> <时间范围> <时间单位>
```

### 视频内容分析
```bash
node examples/video-content-analyzer.js
```

### 启动Web界面
```bash
cd tiktok-web-scraper
npm install
npm run dev
```

## 📝 参数说明

| 参数 | 说明 | 示例 |
|-----|------|------|
| `<作者文件>` | 包含作者用户名的文件 | `authors.txt` |
| `<时间范围>` | 查询的时间范围数字 | `7`, `30`, `2` |
| `<时间单位>` | 时间单位 | `days`, `weeks`, `months` |
| `--skip-capcut-check` | 跳过CapCut检测（提高速度） | 可选参数 |

## 💡 使用技巧

1. **提高速度**：使用 `--skip-capcut-check` 参数跳过CapCut检测
2. **避免限制**：程序自动添加请求间隔，避免被API限制
3. **中文显示**：CSV文件使用UTF-8编码，Excel打开时需正确设置编码
4. **批量处理**：支持一次性处理大量作者，自动生成汇总报告

## 🔧 技术特点

- **ES6模块**：使用现代JavaScript语法
- **异步处理**：支持并发请求提高效率
- **错误处理**：完善的错误处理和重试机制
- **进度显示**：实时显示处理进度和结果预览
- **数据完整性**：确保CSV数据格式正确，支持特殊字符

## 📋 依赖包

```json
{
  "axios": "^1.6.7",
  "csv-writer": "^1.6.0",
  "cli-progress": "^3.12.0",
  "fs-extra": "^11.2.0"
}
```

## 🚨 注意事项

1. **合规使用**：仅获取公开可访问的视频信息
2. **速率限制**：遵守平台API使用限制
3. **存储空间**：大量数据可能占用较多磁盘空间
4. **网络环境**：稳定的网络连接有助于提高成功率

## 📄 许可证

MIT License

---

如有问题或建议，欢迎提Issue！ 🎉