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

    // 检查是否有错误信息
    if (stdout.includes('获取视频失败') || stdout.includes('Error:')) {
      const errorMatch = stdout.match(/获取视频失败: (.+)/) || stdout.match(/Error: (.+)/);
      const errorMessage = errorMatch ? errorMatch[1] : '获取视频数据失败';
      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }

    // 从输出中找到CSV文件路径
    const match = stdout.match(/数据已保存到: (.+\.csv)/);
    if (!match) {
      return NextResponse.json({ error: '未找到输出文件' }, { status: 500 });
    }

    // 读取CSV文件
    const csvPath = match[1];
    const csvContent = await readFile(csvPath, 'utf-8');
    
    // 直接读取CSV内容，不使用columns选项
    const rawRecords = parse(csvContent, {
      skip_empty_lines: true,
      delimiter: ',',
      trim: true,
      fromLine: 2 // 跳过标题行
    });

    // 转换数据格式
    const videos = rawRecords.map(record => ({
      id: record[0], // 视频ID
      description: record[1], // 描述
      author: record[2], // 作者
      likes: record[3], // 点赞数
      plays: record[6], // 播放数
      createTime: `${record[7]} ${record[8]}`, // 合并日期和时间
      videoUrl: record[9] // 视频链接
    }));

    if (videos.length === 0) {
      return NextResponse.json({ error: '未找到视频' }, { status: 404 });
    }

    return NextResponse.json(videos);
  } catch (error: any) {
    console.error('Error:', error);
    // 如果是用户不存在的错误，返回特定的错误信息
    if (error.message?.includes('secUid')) {
      return NextResponse.json({ error: '用户不存在或未找到视频' }, { status: 404 });
    }
    return NextResponse.json(
      { error: '获取作者视频数据失败' },
      { status: 500 }
    );
  }
}