#!/usr/bin/env node

/**
 * 构建时环境文件替换脚本
 * 用法: node scripts/build-env.js <env>
 * env: dev | beta | prod
 */

const fs = require('fs');
const path = require('path');

const env = process.argv[2] || 'dev';
const envMap = {
    dev: 'environment.ts',
    beta: 'environment.beta.ts',
    prod: 'environment.prod.ts',
};

const srcDir = path.join(__dirname, '../src/config');
const targetFile = path.join(srcDir, 'environment.ts');
const sourceFile = path.join(srcDir, envMap[env]);

if (!fs.existsSync(sourceFile)) {
    console.error(`❌ 环境文件不存在: ${sourceFile}`);
    process.exit(1);
}

// 读取源文件内容
const content = fs.readFileSync(sourceFile, 'utf-8');

// 写入目标文件
fs.writeFileSync(targetFile, content, 'utf-8');

console.log(`✅ 环境文件已替换: ${envMap[env]} -> environment.ts`);
