import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 修复CSV文件的中文编码问题
 * @param {string} csvPath - CSV文件路径
 */
export function fixCsvEncoding(csvPath) {
    try {
        // 读取原文件内容
        const content = fs.readFileSync(csvPath, 'utf8');
        
        // 添加BOM标记确保Excel能正确识别UTF-8编码
        const BOM = '\ufeff';
        
        // 如果文件开头没有BOM，则添加
        if (!content.startsWith(BOM)) {
            fs.writeFileSync(csvPath, BOM + content, { encoding: 'utf8' });
            console.log(`✓ 已修复CSV文件编码: ${csvPath}`);
        }
    } catch (error) {
        console.error(`✗ 修复CSV编码失败: ${error.message}`);
    }
}

/**
 * 设置Node.js终端编码
 */
export function setupTerminalEncoding() {
    // 设置环境变量
    process.env.LANG = 'zh_CN.UTF-8';
    process.env.LC_ALL = 'zh_CN.UTF-8';
    
    // 设置输出流编码
    if (process.stdout.setEncoding) {
        process.stdout.setEncoding('utf8');
    }
    if (process.stderr.setEncoding) {
        process.stderr.setEncoding('utf8');
    }
    
    console.log('✓ 终端编码已设置为UTF-8');
}

/**
 * 批量修复output目录下所有CSV文件的编码
 */
export function fixAllCsvFiles() {
    const outputDir = path.join(__dirname, 'output');
    
    if (!fs.existsSync(outputDir)) {
        console.log('output目录不存在，无需修复');
        return;
    }
    
    const files = fs.readdirSync(outputDir);
    const csvFiles = files.filter(file => file.endsWith('.csv'));
    
    if (csvFiles.length === 0) {
        console.log('未找到CSV文件');
        return;
    }
    
    console.log(`找到 ${csvFiles.length} 个CSV文件，开始修复编码...`);
    
    csvFiles.forEach(file => {
        const filePath = path.join(outputDir, file);
        fixCsvEncoding(filePath);
    });
    
    console.log('✅ 所有CSV文件编码修复完成');
}

// 如果直接运行此脚本，则执行修复操作
if (import.meta.url === `file://${process.argv[1]}`) {
    console.log('🔧 开始修复中文编码问题...\n');
    
    setupTerminalEncoding();
    fixAllCsvFiles();
    
    console.log('\n📖 Excel打开CSV文件的正确方法：');
    console.log('1. 打开Excel');
    console.log('2. 选择 "数据" → "从文本/CSV"');
    console.log('3. 选择CSV文件');
    console.log('4. 在"文件原始格式"中选择"UTF-8"');
    console.log('5. 点击"加载"');
    console.log('\n如果还是乱码，请尝试用其他工具如Numbers、LibreOffice等打开。');
}
