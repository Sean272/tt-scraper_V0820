import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { resolve } from 'path';
import { readFile } from 'fs/promises';
import { parse } from 'csv-parse/sync';

const execAsync = promisify(exec);

export async function POST(request: Request) {
  try {
    const { author, timeRange, timeUnit } = await request.json();
    
    if (!author || !timeRange || !timeUnit) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
    }

    const scriptPath = resolve(process.cwd(), '../../examples/user-videos-to-csv.js');
    const { stdout, stderr } = await execAsync(
      `node ${scriptPath} ${author} ${timeRange} ${timeUnit}`
    );

    if (stderr) {
      console.error('Error:', stderr);
      return NextResponse.json({ error: '获取作者视频失败' }, { status: 500 });
    }

    // 从输出中找到CSV文件路径
    const match = stdout.match(/数据已保存到: (.+\.csv)/);
    if (!match) {
      return NextResponse.json({ error: '未找到输出文件' }, { status: 500 });
    }

    const csvPath = match[1];
    const csvContent = await readFile(csvPath, 'utf-8');
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true
    });

    // 转换数据格式
    const videos = records.map((record: any) => ({
      id: record.video_id || record.id,
      description: record.description,
      author: record.author,
      likes: record.likes,
      comments: record.comments,
      plays: record.plays,
      createTime: record.create_time || record.createTime,
      videoUrl: `https://www.tiktok.com/@${record.author}/video/${record.video_id || record.id}`
    }));

    return NextResponse.json(videos);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
