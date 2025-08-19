import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { resolve } from 'path';

const execAsync = promisify(exec);

export async function POST(request: Request) {
  try {
    const { videoId } = await request.json();
    
    if (!videoId) {
      return NextResponse.json({ error: '请提供视频ID' }, { status: 400 });
    }

    const scriptPath = resolve(process.cwd(), '../../examples/show-video-details.js');
    const { stdout, stderr } = await execAsync(`node ${scriptPath} ${videoId}`);

    if (stderr) {
      console.error('Error:', stderr);
      return NextResponse.json({ error: '获取视频信息失败' }, { status: 500 });
    }

    // 解析输出
    const lines = stdout.split('\n');
    const data: any = {};
    let inSummary = false;

    for (const line of lines) {
      if (line.includes('=== 视频信息摘要 ===')) {
        inSummary = true;
        continue;
      }

      if (inSummary && line.trim()) {
        const [key, value] = line.split(':').map(s => s.trim());
        switch (key) {
          case '视频ID':
            data.id = value;
            break;
          case '描述':
            data.description = value;
            break;
          case '作者':
            data.author = value;
            break;
          case '发布时间':
            data.createTime = value;
            break;
          case '播放量':
            data.plays = value;
            break;
          case '点赞数':
            data.likes = value;
            break;
          case '评论数':
            data.comments = value;
            break;
        }
      }
    }

    // 添加视频链接
    data.videoUrl = `https://www.tiktok.com/@${data.author}/video/${data.id}`;

    return NextResponse.json(data);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
