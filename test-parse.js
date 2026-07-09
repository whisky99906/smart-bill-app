import * as XLSX from 'xlsx';
import * as fs from 'fs';
import iconv from 'iconv-lite';

console.log('=== 测试微信账单解析 ===');
const wechatFile = '微信支付账单流水文件(20260608-20260708)_20260708183641.xlsx';
const data = fs.readFileSync(wechatFile);
const workbook = XLSX.read(data, { type: 'buffer' });
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const jsonData = XLSX.utils.sheet_to_json(sheet);

const wechatKeywords = ['微信支付', '微信昵称', '微信支付账单明细'];
const firstFewRows = jsonData.slice(0, 20).map(row => JSON.stringify(row)).join('');
console.log('检测到的关键字:', wechatKeywords.filter(k => firstFewRows.includes(k)));

console.log('\n--- 查找表头行 ---');
for (let i = 0; i < jsonData.length; i++) {
  const row = jsonData[i];
  const rowStr = JSON.stringify(row);
  if (rowStr.includes('交易时间') && rowStr.includes('收/支') && rowStr.includes('金额')) {
    console.log('表头行在:', i);
    console.log('表头内容:', JSON.stringify(row));
    break;
  }
}

console.log('\n--- 查看第15行（实际表头）---');
console.log('第15行:', JSON.stringify(jsonData[14]));
console.log('第15行的键:', Object.keys(jsonData[14]));

console.log('\n--- 查看第16行（第一笔数据）---');
console.log('第16行:', JSON.stringify(jsonData[15]));

console.log('\n=== 测试支付宝账单解析 ===');
const alipayFile = '支付宝交易明细(20260608-20260708).csv';
const buffer = fs.readFileSync(alipayFile);
const content = iconv.decode(buffer, 'gbk');
const lines = content.split('\n').filter(line => line.trim());

console.log('\n--- 查找表头行 ---');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].startsWith('交易时间,交易分类')) {
    console.log('表头行在:', i);
    console.log('表头内容:', lines[i]);
    break;
  }
}

console.log('\n--- 测试parseCSVLine ---');
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

const testLine = lines[22];
console.log('测试行:', testLine);
console.log('解析结果:', parseCSVLine(testLine));