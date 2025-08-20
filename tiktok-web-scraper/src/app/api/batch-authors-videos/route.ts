import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { resolve } from 'path';
import { writeFile } from 'fs/promises';

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
        
        // 解析每个作者的输出
        const lines = stdout.split('\n');
        let inPreviewSection = false;
        let currentVideo: Partial<VideoData> = {};
        let videoCount = 0;
        
        for (const line of lines) {
          const trimmedLine = line.trim();
          
          if (trimmedLine.startsWith('视频 ')) {
            if (currentVideo.description) {
              // 为当前视频生成ID和URL
              currentVideo.id = `${author}-video-${++videoCount}`;
              currentVideo.author = author;
              currentVideo.videoUrl = `https://www.tiktok.com/@${author}/video/${currentVideo.id}`;
              allVideos.push(currentVideo as VideoData);
            }
            currentVideo = {};
            inPreviewSection = true;
          } else if (inPreviewSection && trimmedLine.startsWith('- 描述:')) {
            currentVideo.description = trimmedLine.replace('- 描述:', '').trim();
          } else if (inPreviewSection && trimmedLine.startsWith('- 点赞数:')) {
            currentVideo.likes = trimmedLine.replace('- 点赞数:', '').trim();
          } else if (inPreviewSection && trimmedLine.startsWith('- 播放数:')) {
            currentVideo.plays = trimmedLine.replace('- 播放数:', '').trim();
          } else if (inPreviewSection && trimmedLine.startsWith('- 创建时间:')) {
            currentVideo.createTime = trimmedLine.replace('- 创建时间:', '').trim();
          }
        }
        
        // 添加最后一个视频
        if (currentVideo.description) {
          currentVideo.id = `${author}-video-${++videoCount}`;
          currentVideo.author = author;
          currentVideo.videoUrl = `https://www.tiktok.com/@${author}/video/${currentVideo.id}`;
          allVideos.push(currentVideo as VideoData);
        }
        
        console.log(`作者 ${author} 处理完成，找到 ${videoCount} 个视频`);
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