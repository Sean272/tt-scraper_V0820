import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { createObjectCsvWriter } from 'csv-writer';

// 获取当前文件的目录路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 获取命令行参数
const args = process.argv.slice(2);
const [authorFile, timeRange, timeUnit, ...otherArgs] = args;

// 检查是否跳过 CapCut 检查
const skipCapcutCheck = otherArgs.includes('--skip-capcut-check');

// 验证必需参数
if (!authorFile || !timeRange || !timeUnit) {
  console.error('使用方法: node batch-authors-videos.js <作者文件> <时间范围> <时间单位>');
  console.error('时间单位可以是: days, weeks, months');
  console.error('示例: node batch-authors-videos.js authors.txt 5 days --skip-capcut-check');
  process.exit(1);
}

// 验证时间单位
if (!['days', 'weeks', 'months'].includes(timeUnit)) {
  console.error('无效的时间单位。请使用: days, weeks, months');
  process.exit(1);
}

// 读取作者列表
let authors;
try {
  const content = fs.readFileSync(authorFile, 'utf8');
  
  // 检测文件格式（CSV或纯文本）
  if (content.includes(',')) {
    console.log('检测到CSV格式...');
    authors = content.split('\n')
      .map(line => line.split(',')[0])
      .filter(author => author && author.trim());
  } else {
    console.log('检测到纯文本格式...');
    authors = content.split('\n')
      .map(line => line.trim())
      .filter(Boolean);
  }
} catch (error) {
  console.error('读取作者文件失败:', error);
  process.exit(1);
}

console.log(`找到 ${authors.length} 个作者，开始批量查询...`);

// 准备输出目录
const outputDir = path.join(__dirname, 'output');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

// 准备CSV文件
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const csvPath = path.join(outputDir, `batch_authors_videos_${timestamp.split('T')[0]}.csv`);

const csvWriter = createObjectCsvWriter({
  path: csvPath,
  header: [
    { id: 'id', title: '视频ID' },
    { id: 'description', title: '描述' },
    { id: 'author', title: '作者' },
    { id: 'likes', title: '点赞数' },
    { id: 'comments', title: '评论数' },
    { id: 'shares', title: '分享数' },
    { id: 'plays', title: '播放数' },
    { id: 'createTime', title: '创建时间' },
    { id: 'videoUrl', title: '视频链接' },
    { id: 'isCapCut', title: 'CapCut投稿' },
    { id: 'sourcePlatform', title: '来源平台' }
  ],
  encoding: 'utf8'
});

// 处理结果统计
let successAuthors = 0;
let failedAuthors = 0;
let totalVideos = 0;
let allVideos = [];

// 批量处理作者
for (const author of authors) {
  try {
    console.log(`\n正在获取作者 ${author} 的视频...`);
    
    // 调用获取视频列表的脚本
    const scriptPath = path.join(__dirname, 'user-videos-to-csv.js');
    const skipFlag = skipCapcutCheck ? '--skip-capcut-check' : '';
    const cmd = `node "${scriptPath}" "${author}" ${timeRange} ${timeUnit} ${skipFlag}`;
    
    const result = execSync(cmd, { 
      encoding: 'utf8',
      cwd: path.dirname(scriptPath)
    });
    
    // 解析输出找到视频数量
    const videosMatch = result.match(/找到 (\d+) 个视频在指定时间范围内/);
    const videoCount = videosMatch ? parseInt(videosMatch[1]) : 0;
    
    if (videoCount > 0) {
      console.log(`✓ 找到 ${videoCount} 个视频在指定时间范围内`);
      
      // 读取生成的CSV文件来获取视频数据
      const authorCsvPath = path.join(outputDir, `${author}_videos.csv`);
      if (fs.existsSync(authorCsvPath)) {
        const csvContent = fs.readFileSync(authorCsvPath, 'utf8');
        const lines = csvContent.split('\n').slice(1); // 跳过标题行
        
        const videos = lines
          .filter(line => line.trim())
          .map(line => {
            const columns = line.split(',');
            if (columns.length >= 9) {
              return {
                id: columns[0] || '',
                description: columns[1] || '',
                author: columns[2] || author,
                likes: columns[3] || '0',
                comments: columns[4] || '0',
                shares: columns[5] || '0',
                plays: columns[6] || '0',
                createTime: columns[7] || '',
                videoUrl: columns[8] || '',
                isCapCut: columns[9] || '否',
                sourcePlatform: columns[10] || ''
              };
            }
            return null;
          })
          .filter(Boolean);

        allVideos.push(...videos);
        totalVideos += videoCount;
        successAuthors++;
        
        // 显示前3个视频的预览
        console.log('\n前3个视频预览:');
        videos.slice(0, 3).forEach((video, index) => {
          console.log(`\n视频 ${index + 1}:`);
          console.log(`  描述: ${video.description}`);
          console.log(`  点赞数: ${video.likes}`);
          console.log(`  播放数: ${video.plays}`);
          console.log(`  创建时间: ${video.createTime}`);
        });
        
        console.log(`\n✓ 成功获取 ${videoCount} 个视频`);
        
        // 清理临时文件
        fs.unlinkSync(authorCsvPath);
      }
    } else {
      console.log('未找到视频');
      // 即使没有找到视频，也算作成功处理（因为可能确实没有视频）
      successAuthors++;
    }
  } catch (error) {
    console.error(`✗ 处理作者 ${author} 失败:`, error.message);
    failedAuthors++;
  }
  
  // 添加延迟避免请求过快
  if (authors.indexOf(author) < authors.length - 1) {
    console.log('等待2秒后处理下一个作者...');
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}

// 如果有视频数据，写入CSV
if (allVideos.length > 0) {
  await csvWriter.writeRecords(allVideos);
}

console.log('\n=== 批量获取完成 ===');
console.log(`✓ 成功处理: ${successAuthors} 个作者`);
console.log(`✗ 失败处理: ${failedAuthors} 个作者`);
console.log(`📊 总计获取: ${totalVideos} 个视频信息`);

if (totalVideos > 0) {
  console.log(`📁 数据已保存到: ${csvPath}`);
  
  // 打印CSV使用说明
  console.log('\n📖 如何正确打开CSV文件：');
  console.log('1. 使用Excel打开时，选择"数据" -> "从文本/CSV"');
  console.log('2. 在打开对话框中，确保"文件原始格式"选择为"UTF-8"');
  console.log('3. 点击"加载"即可正确显示中文内容');
} else {
  console.log('❌ 未找到任何视频，不生成CSV文件');
}
