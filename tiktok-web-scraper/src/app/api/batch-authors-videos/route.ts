import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { resolve } from 'path';
import { writeFile, readFile } from 'fs/promises';
import { parse } from 'csv-parse/sync';

const execAsync = promisify(exec);

interface VideoData {
  id: string;
  description: string;
  author: string;
  likes: string;
  plays: string;
  createTime: string;
  videoUrl?: string;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: '请上传文件' },
        { status: 400 }
      );
    }

    // 创建临时目录
    const tempDir = resolve(process.cwd(), '../examples/temp');
    await execAsync(`mkdir -p "${tempDir}"`);

    // 保存上传的文件
    const tempFile = resolve(tempDir, `${Date.now()}-authors.txt`);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(tempFile, buffer);

    // 读取作者列表
    const authorList = buffer.toString('utf-8').trim().split('\n').map(line => line.trim()).filter(line => line);
    
    const allVideos: VideoData[] = [];
    
    // 对每个作者调用单独的脚本
    const scriptPath = resolve(process.cwd(), '../examples/user-videos-to-csv.js');
    
    for (const author of authorList) {
      try {
        console.log(`正在处理作者: ${author}`);
        const { stdout } = await execAsync(
          `node "${scriptPath}" "${author}" 7 days --skip-capcut-check`
        );
        
        // 从输出中提取CSV文件路径
        const saveLineMatch = stdout.match(/数据已保存到:\s*(.+\.csv)/);
        if (saveLineMatch) {
          const csvFilePath = saveLineMatch[1].trim();
          try {
            // 读取CSV文件内容
            const csvContent = await readFile(csvFilePath, 'utf-8');
            const records = parse(csvContent, {
              columns: true,
              skip_empty_lines: true,
              trim: true
            });
            
            // 将CSV数据转换为API格式
            records.forEach((record: any) => {
              if (record['视频ID'] && record['视频ID'].trim()) {
                allVideos.push({
                  id: record['视频ID'].trim(),
                  description: record['描述'] || '-',
                  author: record['作者'] || author,
                  likes: record['点赞数'] || '-',
                  plays: record['播放量'] || record['播放数'] || '-',
                  createTime: record['创建时间'] || '-',
                  videoUrl: `https://www.tiktok.com/@${author}/video/${record['视频ID'].trim()}`
                });
              }
            });
          } catch (csvError) {
            console.error(`读取CSV文件失败 ${csvFilePath}:`, csvError);
          }
        }
        
        console.log(`作者 ${author} 处理完成`);
      } catch (error) {
        console.error(`处理作者 ${author} 时出错:`, error);
      }
    }

    // 清理临时文件
    await execAsync(`rm -f "${tempFile}"`);

    console.log(`批量处理完成，总共找到 ${allVideos.length} 个视频`);
    return NextResponse.json(allVideos);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: '获取作者视频数据失败' },
      { status: 500 }
    );
  }
}