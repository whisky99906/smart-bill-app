import * as XLSX from 'xlsx';
import * as fs from 'fs';
import iconv from 'iconv-lite';

function formatExcelDate(excelDate) {
  if (typeof excelDate === 'string') return excelDate;
  const date = new Date((excelDate - 25569) * 86400 * 1000);
  return date.toISOString().split('T')[0];
}

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

console.log('=== 测试修复后微信账单解析 ===');
const wechatFile = '微信支付账单流水文件(20260608-20260708)_20260708183641.xlsx';
const data = fs.readFileSync(wechatFile);
const workbook = XLSX.read(data, { type: 'buffer' });
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const jsonData = XLSX.utils.sheet_to_json(sheet);

let headerRow = -1;
for (let i = 0; i < jsonData.length; i++) {
  const row = jsonData[i];
  const rowStr = JSON.stringify(row);
  if (rowStr.includes('交易时间') && rowStr.includes('收/支') && rowStr.includes('金额')) {
    headerRow = i;
    break;
  }
}

console.log('表头行索引:', headerRow);

const wechatData = [];
if (headerRow >= 0) {
  for (let i = headerRow + 1; i < jsonData.length; i++) {
    const row = jsonData[i];
    const keys = Object.keys(row);
    const values = keys.map(k => row[k]);
    
    const dateValue = values[0];
    const dateStr = typeof dateValue === 'number' 
      ? formatExcelDate(dateValue) 
      : String(dateValue || '');
    
    wechatData.push({
      date: dateStr,
      type: String(values[4] || ''),
      merchant: String(values[2] || ''),
      note: String(values[3] || '') + ' ' + String(values[10] || ''),
      amount: values[5],
      category: String(values[1] || ''),
      incomeExpense: String(values[4] || ''),
    });
  }
}

console.log('微信账单解析结果:');
console.log('总记录数:', wechatData.length);
console.log('前5条记录:');
for (let i = 0; i < Math.min(5, wechatData.length); i++) {
  console.log(JSON.stringify(wechatData[i]));
}

console.log('\n=== 测试修复后支付宝账单解析 ===');
const alipayFile = '支付宝交易明细(20260608-20260708).csv';
const buffer = fs.readFileSync(alipayFile);
const content = iconv.decode(buffer, 'gbk');
const lines = content.split('\n').filter(line => line.trim());

let alipayHeaderRow = -1;
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.startsWith('交易时间,交易分类') || 
      line.startsWith('交易时间') && line.includes('交易分类') && line.includes('交易对方')) {
    alipayHeaderRow = i;
    break;
  }
}

if (alipayHeaderRow === -1) {
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('交易时间') && lines[i].includes('金额')) {
      alipayHeaderRow = i;
      break;
    }
  }
}

console.log('表头行索引:', alipayHeaderRow);

if (alipayHeaderRow >= 0) {
  const headers = parseCSVLine(lines[alipayHeaderRow]);
  const dateIndex = headers.findIndex(h => h.includes('交易时间') || h.includes('日期'));
  const categoryIndex = headers.findIndex(h => h.includes('交易分类') || h.includes('分类'));
  const merchantIndex = headers.findIndex(h => h.includes('交易对方') || h.includes('对方') || h.includes('商户') || h.includes('商家'));
  const noteIndex = headers.findIndex(h => h.includes('商品说明') || h.includes('商品') || h.includes('备注') || h.includes('摘要'));
  const typeIndex = headers.findIndex(h => h.includes('收/支') || h.includes('收支'));
  const amountIndex = headers.findIndex(h => h.includes('金额'));
  
  console.log('索引位置:', { dateIndex, categoryIndex, merchantIndex, noteIndex, typeIndex, amountIndex });
  
  const alipayData = [];
  for (let i = alipayHeaderRow + 1; i < lines.length; i++) {
    const line = lines[i];
    const values = parseCSVLine(line);
    
    if (values.length < Math.max(dateIndex, categoryIndex, merchantIndex, noteIndex, typeIndex, amountIndex) + 1) {
      continue;
    }
    
    const dateValue = String(values[dateIndex] || '');
    if (!dateValue || !dateValue.match(/\d{4}[-/年]/)) {
      continue;
    }
    
    const amountValue = String(values[amountIndex] || '');
    if (!amountValue || !amountValue.match(/[\d.]+/)) {
      continue;
    }
    
    alipayData.push({
      date: dateValue,
      type: String(values[typeIndex] || ''),
      merchant: String(values[merchantIndex] || ''),
      note: String(values[noteIndex] || ''),
      amount: amountValue,
      category: String(values[categoryIndex] || ''),
      incomeExpense: String(values[typeIndex] || ''),
    });
  }
  
  console.log('支付宝账单解析结果:');
  console.log('总记录数:', alipayData.length);
  console.log('前5条记录:');
  for (let i = 0; i < Math.min(5, alipayData.length); i++) {
    console.log(JSON.stringify(alipayData[i]));
  }
}