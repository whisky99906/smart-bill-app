import * as XLSX from 'xlsx';
import * as fs from 'fs';

const data = fs.readFileSync('微信支付账单流水文件(20260608-20260708)_20260708183641.xlsx');
const workbook = XLSX.read(data, { type: 'buffer' });
console.log('Sheet names:', workbook.SheetNames);

const sheet = workbook.Sheets[workbook.SheetNames[0]];
const json = XLSX.utils.sheet_to_json(sheet);

console.log('Total rows:', json.length);
console.log('\n--- First 20 rows ---');
for (let i = 0; i < Math.min(20, json.length); i++) {
  console.log(`Row ${i + 1}:`, JSON.stringify(json[i]));
}