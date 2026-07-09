import * as XLSX from 'xlsx';
import * as fs from 'fs';

function formatExcelDate(excelDate) {
  if (typeof excelDate === 'string') return excelDate;
  const date = new Date((excelDate - 25569) * 86400 * 1000);
  return date.toISOString().split('T')[0];
}

const wechatFile = '微信支付账单流水文件(20260608-20260708)_20260708183641.xlsx';
const data = fs.readFileSync(wechatFile);
const workbook = XLSX.read(data, { type: 'buffer' });
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const jsonData = XLSX.utils.sheet_to_json(sheet);

console.log('=== 测试修复后的微信账单解析 ===');
console.log('总数据行数:', jsonData.length);

let headerRow = -1;
const fieldKeys = {};

for (let i = 0; i < jsonData.length; i++) {
  const row = jsonData[i];
  const rowStr = JSON.stringify(row);
  
  if (rowStr.includes('交易时间') && rowStr.includes('收/支') && rowStr.includes('金额')) {
    headerRow = i;
    
    for (const key of Object.keys(row)) {
      const value = String(row[key] || '');
      if (value.includes('交易时间')) fieldKeys.date = key;
      else if (value.includes('交易类型')) fieldKeys.type = key;
      else if (value.includes('交易对方')) fieldKeys.merchant = key;
      else if (value.includes('商品')) fieldKeys.note = key;
      else if (value.includes('收/支')) fieldKeys.incomeExpense = key;
      else if (value.includes('金额')) fieldKeys.amount = key;
      else if (value.includes('备注')) fieldKeys.comment = key;
    }
    console.log('表头行索引:', headerRow);
    console.log('字段映射:', fieldKeys);
    break;
  }
}

const result = [];
if (headerRow >= 0) {
  for (let i = headerRow + 1; i < jsonData.length; i++) {
    const row = jsonData[i];
    
    const dateValue = row[fieldKeys.date];
    const dateStr = typeof dateValue === 'number' 
      ? formatExcelDate(dateValue) 
      : String(dateValue || '');
    
    const amountValue = row[fieldKeys.amount];
    
    result.push({
      date: dateStr,
      type: String(row[fieldKeys.incomeExpense] || ''),
      merchant: String(row[fieldKeys.merchant] || ''),
      note: String(row[fieldKeys.note] || '') + ' ' + String(row[fieldKeys.comment] || ''),
      amount: amountValue,
      category: String(row[fieldKeys.type] || ''),
      incomeExpense: String(row[fieldKeys.incomeExpense] || ''),
    });
  }
}

console.log('解析结果:');
console.log('总记录数:', result.length);
console.log('前10条记录:');
for (let i = 0; i < Math.min(10, result.length); i++) {
  console.log(JSON.stringify(result[i]));
}

console.log('\n=== 检查金额字段 ===');
const amounts = result.map(r => r.amount);
console.log('金额值列表:', amounts.slice(0, 10));
console.log('金额类型:', typeof amounts[0]);
console.log('是否有非零金额:', amounts.some(a => a !== 0 && a !== '0' && a !== ''));