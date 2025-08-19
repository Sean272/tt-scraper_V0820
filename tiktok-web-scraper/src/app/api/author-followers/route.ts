import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { resolve } from 'path';
import { writeFile, readFile } from 'fs/promises';
import { parse } from 'csv-parse/sync';

const execAsync = promisify(exec);

export async function POST(request: Request) {
  try {
    const { author } = await request.json();
    
    if (!author) {
      return NextResponse.json({ error: '请提供作者用户名' }, { status: 400 });
    }

    // 创建临时文件
    const tempFile = resolve(process.cwd(), '../../examples/temp', `${Date.now()}-author.txt`);
    await writeFile(tempFile, author);

    const scriptPath = resolve(process.cwd(), '../../examples/batch-authors-followers.js');
    const { stdout, stderr } = await execAsync(`node ${scriptPath} ${tempFile}`);

    if (stderr) {
      console.error('Error:', stderr);
      return NextResponse.json({ error: '获取作者粉丝信息失败' }, { status: 500 });
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

    if (records.length === 0) {
      return NextResponse.json({ error: '未找到作者信息' }, { status: 404 });
    }

    // 转换数据格式
    const authorData = records[0];
    return NextResponse.json({
      author: authorData.author,
      followers: authorData.followers,
      following: authorData.following,
      likes: authorData.likes,
      videos: authorData.videos
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
