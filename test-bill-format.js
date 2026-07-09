import fs from 'fs';
import iconv from 'iconv-lite';

console.log('=== 支付宝账单完整内容 ===');
const alipayFile = '支付宝交易明细(20260608-20260708).csv';
try {
  const buffer = fs.readFileSync(alipayFile);
  const content = iconv.decode(buffer, 'gbk');
  const lines = content.split('\n').filter(line => line.trim());
  console.log('总行数:', lines.length);
  for (let i = 0; i < lines.length; i++) {
    console.log(`第${i+1}行:`, lines[i]);
  }
} catch (err) {
  console.error('读取支付宝文件失败:', err.message);
}