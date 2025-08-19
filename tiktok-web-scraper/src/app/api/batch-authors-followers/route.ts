import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { resolve } from 'path';
import { writeFile, readFile } from 'fs/promises';
import { parse } from 'csv-parse/sync';

const execAsync = promisify(exec);

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: '请提供作者列表文件' }, { status: 400 });
    }

    // 保存上传的文件
    const tempFile = resolve(process.cwd(), '../../examples/temp', `${Date.now()}-authors.txt`);
    await writeFile(tempFile, Buffer.from(await file.arrayBuffer()));

    const scriptPath = resolve(process.cwd(), '../../examples/batch-authors-followers.js');
    const { stdout, stderr } = await execAsync(`node ${scriptPath} ${tempFile}`);

    if (stderr) {
      console.error('Error:', stderr);
      return NextResponse.json({ error: '批量获取作者粉丝信息失败' }, { status: 500 });
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
    const authors = records.map((record: any) => ({
      author: record.author,
      followers: record.followers,
      following: record.following,
      likes: record.likes,
      videos: record.videos
    }));

    return NextResponse.json(authors);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
