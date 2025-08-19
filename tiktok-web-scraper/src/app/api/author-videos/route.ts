import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { resolve } from 'path';
import { readFile } from 'fs/promises';
import { parse } from 'csv-parse/sync';

const execAsync = promisify(exec);

interface VideoData {
  id: string;
  description: string;
  author: string;
  likes: string;
  plays: string;
  createTime: string;
  videoUrl: string;
}

export async function POST(request: Request) {
  try {
    const { author, timeRange: originalTimeRange, timeUnit } = await request.json();

    // 打印请求参数
    console.log('Request params:', { author, originalTimeRange, timeUnit });

    // 绝对路径
    const scriptPath = resolve(process.cwd(), '../examples/user-videos-to-csv.js');

    // 转换时间单位
    let unitArg: string;
    let adjustedTimeRange: number;

    switch (timeUnit) {
      case 'days':
        unitArg = 'days';
        adjustedTimeRange = parseInt(originalTimeRange);
        break;
      case 'weeks':
        unitArg = 'weeks';
        adjustedTimeRange = parseInt(originalTimeRange);
        break;
      case 'months':
        unitArg = 'months';
        adjustedTimeRange = parseInt(originalTimeRange);
        break;
      default:
        throw new Error('不支持的时间单位');
    }

    // 打印转换后的参数
    console.log('Adjusted params:', { adjustedTimeRange, unitArg });

    // 调用 Node.js 脚本
    const cmd = `node "${scriptPath}" "${author}" ${adjustedTimeRange} ${unitArg} --skip-capcut-check`;
    console.log('Executing command:', cmd);

    const { stdout, stderr } = await execAsync(cmd);

    // 打印原始输出
    console.log('Raw stdout:', stdout);
    if (stderr) console.error('Raw stderr:', stderr);

    // 从输出中找到CSV文件路径
    const match = stdout.match(/数据已保存到: (.+\.csv)/);
    if (!match) {
      return NextResponse.json({ error: '未找到输出文件' }, { status: 500 });
    }

    // 读取CSV文件
    const csvPath = match[1];
    const csvContent = await readFile(csvPath, 'utf-8');
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      delimiter: ',',
      relax_column_count: true // 允许列数不一致
    });

    // 转换数据格式
    const videos = records.map((record: any) => ({
      id: record['视频ID'],
      description: record['描述'],
      author: record['作者'],
      likes: record['点赞数'],
      plays: record['播放数'],
      createTime: record['创建时间'].trim(), // 去除可能的前后空格
      videoUrl: record['视频链接']
    }));

    return NextResponse.json(videos);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: '获取作者视频数据失败' },
      { status: 500 }
    );
  }
}