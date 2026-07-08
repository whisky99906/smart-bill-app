import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { ClayCard, ClayButton, ClayTab } from '@/components';
import { useTransactionStore, useCategoryStore, useMerchantRuleStore } from '@/store/useStore';
import { getIcon } from '@/utils/icons';
import { suggestCategory } from '@/utils/aiService';
import { billCategoryMapping, normalizeMerchant } from '@/utils/category';
import type { Category } from '@/types';
import { ArrowLeft, Upload, CheckCircle, Sparkles, Wand2, Bot, Loader2 } from 'lucide-react';

type FieldType = 'date' | 'amount' | 'merchant' | 'type' | 'note' | 'category' | 'ignore';

interface ParsedRow {
  [key: string]: string | number;
}

interface ImportRow {
  original: ParsedRow;
  date: string;
  amount: string;
  merchant: string;
  type: 'expense' | 'income' | '';
  note: string;
  categoryL1: string;
  categoryL2: string;
}

const wechatKeywords = ['微信支付', '微信昵称', '微信支付账单明细'];
const alipayKeywords = ['支付宝', '支付宝交易'];

const smartCategoryKeywords: Record<string, { l1: string; l2: string }[]> = {
  餐饮: [{ l1: 'food', l2: 'food-lunch' }, { l1: 'food', l2: 'food-dinner' }, { l1: 'food', l2: 'food-breakfast' }],
  外卖: [{ l1: 'food', l2: 'food-lunch' }, { l1: 'food', l2: 'food-dinner' }],
  奶茶: [{ l1: 'food', l2: 'food-snack' }],
  咖啡: [{ l1: 'food', l2: 'food-snack' }],
  零食: [{ l1: 'food', l2: 'food-snack' }],
  早餐: [{ l1: 'food', l2: 'food-breakfast' }],
  午餐: [{ l1: 'food', l2: 'food-lunch' }],
  晚餐: [{ l1: 'food', l2: 'food-dinner' }],
  服装: [{ l1: 'shopping', l2: 'shopping-clothes' }],
  购物: [{ l1: 'shopping', l2: 'shopping-daily' }],
  数码: [{ l1: 'shopping', l2: 'shopping-electronics' }],
  美妆: [{ l1: 'shopping', l2: 'shopping-beauty' }],
  公交: [{ l1: 'transport', l2: 'transport-bus' }],
  地铁: [{ l1: 'transport', l2: 'transport-subway' }],
  打车: [{ l1: 'transport', l2: 'transport-taxi' }],
  滴滴: [{ l1: 'transport', l2: 'transport-taxi' }],
  加油: [{ l1: 'transport', l2: 'transport-fuel' }],
  电影: [{ l1: 'entertainment', l2: 'entertainment-movie' }],
  游戏: [{ l1: 'entertainment', l2: 'entertainment-game' }],
  旅行: [{ l1: 'entertainment', l2: 'entertainment-travel' }],
  运动: [{ l1: 'entertainment', l2: 'entertainment-sport' }],
  房租: [{ l1: 'living', l2: 'living-rent' }],
  水电: [{ l1: 'living', l2: 'living-water' }],
  网费: [{ l1: 'living', l2: 'living-internet' }],
  工资: [{ l1: 'salary', l2: 'salary-monthly' }],
  奖金: [{ l1: 'salary', l2: 'salary-bonus' }],
  理财: [{ l1: 'investment', l2: 'investment-fund' }],
  红包: [{ l1: 'gift-income', l2: 'gift-income-redpacket' }, { l1: 'other-expense', l2: 'other-expense-redpacket' }],
  医疗: [{ l1: 'medical', l2: 'medical-hospital' }, { l1: 'medical', l2: 'medical-drug' }],
  书籍: [{ l1: 'study', l2: 'study-book' }],
  课程: [{ l1: 'study', l2: 'study-course' }],
  美团: [{ l1: 'food', l2: 'food-lunch' }, { l1: 'food', l2: 'food-dinner' }, { l1: 'food', l2: 'food-snack' }],
  饿了么: [{ l1: 'food', l2: 'food-lunch' }, { l1: 'food', l2: 'food-dinner' }],
  星巴克: [{ l1: 'food', l2: 'food-snack' }],
  肯德基: [{ l1: 'food', l2: 'food-lunch' }],
  麦当劳: [{ l1: 'food', l2: 'food-lunch' }],
  瑞幸: [{ l1: 'food', l2: 'food-snack' }],
  淘宝: [{ l1: 'shopping', l2: 'shopping-daily' }],
  京东: [{ l1: 'shopping', l2: 'shopping-electronics' }],
  拼多多: [{ l1: 'shopping', l2: 'shopping-daily' }],
  滴滴出行: [{ l1: 'transport', l2: 'transport-taxi' }],
  高德: [{ l1: 'transport', l2: 'transport-taxi' }],
  携程: [{ l1: 'entertainment', l2: 'entertainment-travel' }],
  美团外卖: [{ l1: 'food', l2: 'food-lunch' }, { l1: 'food', l2: 'food-dinner' }],
};

const detectBillType = (jsonData: ParsedRow[]): 'wechat' | 'alipay' | 'unknown' => {
  const firstFewRows = jsonData.slice(0, 20).map(row => JSON.stringify(row)).join('');
  if (wechatKeywords.some(k => firstFewRows.includes(k))) return 'wechat';
  if (alipayKeywords.some(k => firstFewRows.includes(k))) return 'alipay';
  return 'unknown';
};

const parseWechatBill = (jsonData: ParsedRow[]): ParsedRow[] => {
  const data: ParsedRow[] = [];
  let headerRow = -1;
  const fieldKeys: Record<string, string> = {};
  
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
      continue;
    }
    
    if (headerRow >= 0 && i > headerRow) {
      const dateValue = row[fieldKeys.date];
      const dateStr = typeof dateValue === 'number' 
        ? formatExcelDate(dateValue) 
        : String(dateValue || '');
      
      const amountValue = row[fieldKeys.amount];
      
      data.push({
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
  
  return data;
};

const parseAlipayCSV = (fileContent: string): ParsedRow[] => {
  const data: ParsedRow[] = [];
  const lines = fileContent.split('\n').filter(line => line.trim());
  
  let headerRow = -1;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('交易时间,交易分类') || 
        line.startsWith('交易时间') && line.includes('交易分类') && line.includes('交易对方')) {
      headerRow = i;
      break;
    }
  }
  
  if (headerRow === -1) {
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('交易时间') && lines[i].includes('金额')) {
        headerRow = i;
        break;
      }
    }
  }
  
  if (headerRow === -1) return data;
  
  const headers = parseCSVLine(lines[headerRow]);
  const dateIndex = headers.findIndex(h => h.includes('交易时间') || h.includes('日期'));
  const categoryIndex = headers.findIndex(h => h.includes('交易分类') || h.includes('分类'));
  const merchantIndex = headers.findIndex(h => h.includes('交易对方') || h.includes('对方') || h.includes('商户') || h.includes('商家'));
  const noteIndex = headers.findIndex(h => h.includes('商品说明') || h.includes('商品') || h.includes('备注') || h.includes('摘要'));
  const typeIndex = headers.findIndex(h => h.includes('收/支') || h.includes('收支'));
  const amountIndex = headers.findIndex(h => h.includes('金额'));
  
  const minValidIndex = Math.min(dateIndex, categoryIndex, merchantIndex, noteIndex, typeIndex, amountIndex);
  if (minValidIndex < 0) return data;
  
  for (let i = headerRow + 1; i < lines.length; i++) {
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
    
    data.push({
      date: dateValue,
      type: String(values[typeIndex] || ''),
      merchant: String(values[merchantIndex] || ''),
      note: String(values[noteIndex] || ''),
      amount: amountValue,
      category: String(values[categoryIndex] || ''),
      incomeExpense: String(values[typeIndex] || ''),
    });
  }
  
  return data;
};

const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
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
};

const parseAlipayBill = (jsonData: ParsedRow[]): ParsedRow[] => {
  const data: ParsedRow[] = [];
  let headerRow = -1;
  
  for (let i = 0; i < jsonData.length; i++) {
    const row = jsonData[i];
    const keys = Object.keys(row);
    
    if (keys.some(k => String(row[k]).includes('交易时间')) && keys.some(k => String(row[k]).includes('交易分类'))) {
      headerRow = i;
      continue;
    }
    
    if (headerRow >= 0 && i > headerRow) {
      let dateKey = '';
      let amountKey = '';
      let typeKey = '';
      let merchantKey = '';
      let noteKey = '';
      let categoryKey = '';
      
      for (const key of keys) {
        if (key.includes('时间') || key.includes('日期')) dateKey = key;
        if (key.includes('金额') || key.includes('收支')) amountKey = key;
        if (key.includes('收/支') || key.includes('收支')) typeKey = key;
        if (key.includes('对方') || key.includes('商家') || key.includes('商户')) merchantKey = key;
        if (key.includes('备注') || key.includes('商品') || key.includes('摘要')) noteKey = key;
        if (key.includes('分类')) categoryKey = key;
      }
      
      data.push({
        date: String(row[dateKey] || ''),
        type: String(row[typeKey] || ''),
        merchant: String(row[merchantKey] || ''),
        note: String(row[noteKey] || ''),
        amount: row[amountKey],
        category: String(row[categoryKey] || ''),
        incomeExpense: String(row[typeKey] || ''),
      });
    }
  }
  
  return data;
};

const formatExcelDate = (excelDate: number): string => {
  const date = new Date((excelDate - 25569) * 86400 * 1000);
  return date.toISOString().split('T')[0];
};

const smartMatchCategory = (text: string, type: 'expense' | 'income' | ''): { l1: string; l2: string } | null => {
  for (const [keyword, categories] of Object.entries(smartCategoryKeywords)) {
    if (text.includes(keyword)) {
      const filtered = categories.filter(c => {
        if (type === 'income') {
          return c.l1 === 'salary' || c.l1 === 'investment' || c.l1 === 'part-time' || c.l1 === 'gift-income' || c.l1 === 'other-income';
        }
        if (type === 'expense') {
          return c.l1 !== 'salary' && c.l1 !== 'investment' && c.l1 !== 'part-time' && c.l1 !== 'gift-income' && c.l1 !== 'other-income';
        }
        return true;
      });
      return filtered[0] || categories[0];
    }
  }
  return null;
};

export const ExcelImport = () => {
  const navigate = useNavigate();
  const addTransaction = useTransactionStore((state) => state.addTransaction);
  const getMainCategories = useCategoryStore((state) => state.getMainCategories);
  const getSubCategories = useCategoryStore((state) => state.getSubCategories);
  const matchMerchant = useMerchantRuleStore((state) => state.matchMerchant);
  const incrementUseCount = useMerchantRuleStore((state) => state.incrementUseCount);
  
  const [step, setStep] = useState(1);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [fullRows, setFullRows] = useState<ParsedRow[]>([]);
  const [fieldMapping, setFieldMapping] = useState<Record<string, FieldType>>({});
  const [importRows, setImportRows] = useState<ImportRow[]>([]);
  const [importResult, setImportResult] = useState<{ success: number; failed: number } | null>(null);
  const [isAiMatching, setIsAiMatching] = useState(false);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const fileName = selectedFile.name.toLowerCase();
    const reader = new FileReader();
    reader.onload = (event) => {
      
      if (fileName.endsWith('.csv')) {
        const content = event.target?.result as string;
        const parsedData = parseAlipayCSV(content);
        
        if (parsedData.length > 0) {
          setHeaders(Object.keys(parsedData[0]));
          setRows(parsedData.slice(0, 50));
          setFullRows(parsedData);
          
          setFieldMapping({
            date: 'date',
            amount: 'amount',
            merchant: 'merchant',
            type: 'type',
            note: 'note',
          });
          handleNextStep(parsedData);
        }
        return;
      }

      const data = new Uint8Array(event.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json<ParsedRow>(worksheet);
      
      const detectedType = detectBillType(jsonData);
      let parsedData = jsonData;
      if (detectedType === 'wechat') {
        parsedData = parseWechatBill(jsonData);
      } else if (detectedType === 'alipay') {
        parsedData = parseAlipayBill(jsonData);
      }
      
      if (parsedData.length > 0) {
        setHeaders(Object.keys(parsedData[0]));
        setRows(parsedData.slice(0, 50));
        setFullRows(parsedData);
        
        if (detectedType !== 'unknown') {
          setFieldMapping({
            date: 'date',
            amount: 'amount',
            merchant: 'merchant',
            type: 'type',
            note: 'note',
          });
          handleNextStep(parsedData);
        } else {
          setStep(2);
        }
      }
    };
    
    if (fileName.toLowerCase().endsWith('.csv')) {
      reader.readAsText(selectedFile, 'GBK');
    } else {
      reader.readAsArrayBuffer(selectedFile);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (!droppedFile) return;

    const fileName = droppedFile.name.toLowerCase();
    const reader = new FileReader();
    reader.onload = (event) => {
      
      if (fileName.endsWith('.csv')) {
        const content = event.target?.result as string;
        const parsedData = parseAlipayCSV(content);
        
        if (parsedData.length > 0) {
          setHeaders(Object.keys(parsedData[0]));
          setRows(parsedData.slice(0, 50));
          setFullRows(parsedData);
          
          setFieldMapping({
            date: 'date',
            amount: 'amount',
            merchant: 'merchant',
            type: 'type',
            note: 'note',
          });
          handleNextStep(parsedData);
        }
        return;
      }

      const data = new Uint8Array(event.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json<ParsedRow>(worksheet);
      
      const detectedType = detectBillType(jsonData);
      let parsedData = jsonData;
      if (detectedType === 'wechat') {
        parsedData = parseWechatBill(jsonData);
      } else if (detectedType === 'alipay') {
        parsedData = parseAlipayBill(jsonData);
      }
      
      if (parsedData.length > 0) {
        setHeaders(Object.keys(parsedData[0]));
        setRows(parsedData.slice(0, 50));
        setFullRows(parsedData);
        
        if (detectedType !== 'unknown') {
          setFieldMapping({
            date: 'date',
            amount: 'amount',
            merchant: 'merchant',
            type: 'type',
            note: 'note',
          });
          handleNextStep(parsedData);
        } else {
          setStep(2);
        }
      }
    };
    
    if (fileName.toLowerCase().endsWith('.csv')) {
      reader.readAsText(droppedFile, 'GBK');
    } else {
      reader.readAsArrayBuffer(droppedFile);
    }
  }, []);

  const handleFieldChange = (header: string, field: FieldType) => {
    setFieldMapping({ ...fieldMapping, [header]: field });
  };

  const handleNextStep = (data?: ParsedRow[]) => {
    const rowsToProcess = data || fullRows;
    const currentHeaders = data ? Object.keys(data[0]) : headers;
    
    const mappedRows: ImportRow[] = rowsToProcess.map((row) => {
      const dateKey = currentHeaders.find(h => fieldMapping[h] === 'date' || h === 'date') || 'date';
      const amountKey = currentHeaders.find(h => fieldMapping[h] === 'amount' || h === 'amount') || 'amount';
      const merchantKey = currentHeaders.find(h => fieldMapping[h] === 'merchant' || h === 'merchant') || 'merchant';
      const typeKey = currentHeaders.find(h => fieldMapping[h] === 'type' || h === 'type') || 'type';
      const noteKey = currentHeaders.find(h => fieldMapping[h] === 'note' || h === 'note') || 'note';
      
      const date = String(row[dateKey] || '');
      const amount = row[amountKey] || '';
      const merchant = String(row[merchantKey] || '');
      const type = String(row[typeKey] || '');
      const note = String(row[noteKey] || '');

      const textToMatch = `${merchant} ${note} ${type}`;
      const incomeExpense = String(row['incomeExpense'] || type);
      const isIncome = incomeExpense.includes('收入') || incomeExpense.includes('+') || incomeExpense.includes('转入');
      const isExpense = incomeExpense.includes('支出') || incomeExpense.includes('-') || incomeExpense.includes('转出');
      const transactionType = isIncome ? 'income' : (isExpense ? 'expense' : '');

      let categoryL1 = '';
      let categoryL2 = '';

      const billCategory = String(row['category'] || row['交易分类'] || row['类型'] || '').trim();
      const mappedFromBill = billCategoryMapping[billCategory];
      if (mappedFromBill) {
        categoryL1 = mappedFromBill.categoryL1;
        categoryL2 = mappedFromBill.categoryL2;
      } else {
        const smartMatch = smartMatchCategory(textToMatch, transactionType);
        if (smartMatch) {
          categoryL1 = smartMatch.l1;
          categoryL2 = smartMatch.l2;
        } else {
          const normalizedMerchant = normalizeMerchant(merchant);
          const matched = matchMerchant(normalizedMerchant);
          if (matched) {
            categoryL1 = matched.categoryL1;
            categoryL2 = matched.categoryL2;
          }
        }
      }

      if (!categoryL1) {
        categoryL1 = transactionType === 'income' ? 'other-income' : 'other-expense';
        categoryL2 = transactionType === 'income' ? 'other-income-unknown' : 'other-expense-gift';
      }

      const normalizedMerchant = normalizeMerchant(merchant);

      return {
        original: row,
        date: formatDate(String(date)),
        amount: formatAmount(amount),
        merchant: normalizedMerchant,
        type: transactionType,
        note,
        categoryL1,
        categoryL2,
      };
    });

    setImportRows(mappedRows);
    setStep(3);
  };

  const formatDate = (dateStr: string): string => {
    if (!dateStr) return new Date().toISOString().split('T')[0];
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
    const match = dateStr.match(/(\d{4})[-/年](\d{1,2})[-/月](\d{1,2})/);
    if (match) {
      return `${match[1]}-${String(match[2]).padStart(2, '0')}-${String(match[3]).padStart(2, '0')}`;
    }
    return new Date().toISOString().split('T')[0];
  };

  const formatAmount = (amountVal: string | number): string => {
    if (amountVal === null || amountVal === undefined || amountVal === '') return '0';
    
    if (typeof amountVal === 'number') {
      if (isNaN(amountVal) || !isFinite(amountVal)) return '0';
      return Math.abs(amountVal).toString();
    }
    
    const cleaned = amountVal.replace(/[,\s¥￥$]/g, '');
    const match = cleaned.match(/-?\d+(\.\d+)?/);
    return match ? Math.abs(parseFloat(match[0])).toString() : '0';
  };

  const handleCategoryChange = (rowIndex: number, level: 'L1' | 'L2', value: string) => {
    const newRows = [...importRows];
    if (level === 'L1') {
      newRows[rowIndex].categoryL1 = value;
      newRows[rowIndex].categoryL2 = '';
    } else {
      newRows[rowIndex].categoryL2 = value;
    }
    setImportRows(newRows);
  };

  const handleMerchantChange = (rowIndex: number, value: string) => {
    const newRows = [...importRows];
    newRows[rowIndex].merchant = value.trim();
    setImportRows(newRows);
  };

  const handleNoteChange = (rowIndex: number, value: string) => {
    const newRows = [...importRows];
    newRows[rowIndex].note = value.trim();
    setImportRows(newRows);
  };

  const handleBatchAutoMatch = () => {
    const newRows = importRows.map((row) => {
      if (row.categoryL1 && row.categoryL2) return row;
      
      const textToMatch = `${row.merchant} ${row.note}`;
      const smartMatch = smartMatchCategory(textToMatch, row.type);
      if (smartMatch) {
        return { ...row, categoryL1: smartMatch.l1, categoryL2: smartMatch.l2 };
      }
      return row;
    });
    setImportRows(newRows);
  };

  const handleAIMatch = async () => {
    setIsAiMatching(true);
    
    const uncategorizedRows = importRows.map((row, index) => ({
      index,
      merchant: row.merchant,
      note: row.note,
      type: row.type,
    })).filter(row => !row.merchant || !row.note || (!row.type && (!row.merchant.includes('收入') && !row.merchant.includes('支出'))));

    const newRows = [...importRows];
    
    for (const { index, merchant, note, type } of uncategorizedRows) {
      const suggestion = await suggestCategory(merchant, note, type);
      if (suggestion && suggestion.confidence > 0.6) {
        newRows[index] = {
          ...newRows[index],
          categoryL1: suggestion.categoryL1,
          categoryL2: suggestion.categoryL2,
        };
      }
    }
    
    setImportRows(newRows);
    setIsAiMatching(false);
  };

  const handleImport = () => {
    let success = 0;
    let failed = 0;
    const newlyMatchedRuleIds = new Set<string>();

    importRows.forEach((row) => {
      if (!row.date || row.amount === '' || !row.categoryL1 || !row.categoryL2) {
        failed++;
        return;
      }

      const parsedAmount = parseFloat(row.amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        failed++;
        return;
      }

      try {
        addTransaction({
          date: row.date,
          amount: parsedAmount,
          type: row.type || 'expense',
          categoryL1: row.categoryL1,
          categoryL2: row.categoryL2,
          merchant: row.merchant || '未知商户',
          note: row.note,
          source: 'excel',
        });

        const matched = matchMerchant(row.merchant);
        if (matched && (matched as any).ruleId) {
          newlyMatchedRuleIds.add((matched as any).ruleId);
        }

        success++;
      } catch (error) {
        console.error('导入失败:', error);
        failed++;
      }
    });

    newlyMatchedRuleIds.forEach(id => incrementUseCount(id));

    setImportResult({ success, failed });
    setStep(4);
  };

  const handleReset = () => {
    setStep(1);
    setHeaders([]);
    setRows([]);
    setFieldMapping({});
    setImportRows([]);
    setImportResult(null);
  };

  const mainCategories = getMainCategories();

  return (
    <div className="min-h-screen bg-clay-bg pb-20">
      <div className="px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <button 
            className="text-text-secondary text-lg"
            onClick={() => navigate('/')}
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-text-primary">Excel导入</h1>
          <div className="w-6" />
        </div>

        <ClayTab 
          tabs={[
            { id: '1', label: '选择文件' },
            { id: '2', label: '列匹配' },
            { id: '3', label: '分类确认' },
            { id: '4', label: '导入结果' },
          ]}
          activeTab={step.toString()}
          onChange={() => {}}
          className="justify-center mb-6"
        />

        {step === 1 && (
          <div>
            <ClayCard className="p-4 mb-4 flex items-center gap-3">
              <Sparkles size={24} className="text-clay-primary" />
              <div>
                <p className="text-text-primary font-medium">智能识别</p>
                <p className="text-text-tertiary text-sm">支持微信支付、支付宝账单自动解析和智能分类</p>
              </div>
            </ClayCard>
            
            <ClayCard 
              className="p-12 text-center border-2 border-dashed border-gray-300 cursor-pointer"
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => document.getElementById('file-input')?.click()}
            >
              <input
                id="file-input"
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Upload size={48} className="mx-auto mb-4 text-clay-primary" />
              <p className="text-text-primary font-medium mb-2">点击选择文件</p>
              <p className="text-text-tertiary text-sm">或拖拽文件到此处</p>
              <p className="text-text-tertiary text-xs mt-4">支持 .xlsx / .xls / .csv</p>
            </ClayCard>
          </div>
        )}

        {step === 2 && (
          <div>
            <p className="text-text-secondary text-sm mb-4">请选择每列对应的字段</p>
            <ClayCard className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left p-2 text-text-tertiary text-xs">列名</th>
                    <th className="text-left p-2 text-text-tertiary text-xs">示例数据</th>
                    <th className="text-left p-2 text-text-tertiary text-xs">匹配字段</th>
                  </tr>
                </thead>
                <tbody>
                  {headers.map((header) => (
                    <tr key={header}>
                      <td className="p-2 text-text-primary">{header}</td>
                      <td className="p-2 text-text-secondary text-sm">
                        {rows[0]?.[header]?.toString().slice(0, 20)}...
                      </td>
                      <td className="p-2">
                        <select
                          value={fieldMapping[header] || 'ignore'}
                          onChange={(e) => handleFieldChange(header, e.target.value as FieldType)}
                          className="clay-input text-sm"
                        >
                          <option value="ignore">忽略</option>
                          <option value="date">日期 *</option>
                          <option value="amount">金额 *</option>
                          <option value="merchant">商户/摘要 *</option>
                          <option value="type">收支类型</option>
                          <option value="note">备注</option>
                          <option value="category">分类</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ClayCard>
            <div className="flex gap-4 mt-6">
              <ClayButton className="flex-1" variant="secondary" onClick={handleReset}>
                返回
              </ClayButton>
              <ClayButton 
                className="flex-1" 
                onClick={() => handleNextStep()}
                disabled={!fieldMapping.date || !fieldMapping.amount || !fieldMapping.merchant}
              >
                下一步
              </ClayButton>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-text-secondary text-sm">
                共 {importRows.length} 条，已智能分类 {importRows.filter(r => r.categoryL1 && r.categoryL2).length} 条
              </p>
              <div className="flex gap-2">
                <ClayButton className="px-4 py-2 text-sm" variant="secondary" onClick={handleBatchAutoMatch}>
                  <Wand2 size={16} className="mr-2" />
                  关键词匹配
                </ClayButton>
                <ClayButton className="px-4 py-2 text-sm" variant="secondary" onClick={handleAIMatch} disabled={isAiMatching}>
                  {isAiMatching ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Bot size={16} className="mr-2" />}
                  {isAiMatching ? 'AI分析中...' : 'AI智能分类'}
                </ClayButton>
                <ClayButton className="px-4 py-2 text-sm" onClick={handleImport}>
                  确认导入
                </ClayButton>
              </div>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {importRows.map((row, index) => {
                const mainCategory = getMainCategories().find(c => c.id === row.categoryL1);
                const MainIcon = getIcon(mainCategory?.icon || 'other');
                
                return (
                  <ClayCard key={index} className="p-3 flex flex-wrap items-center gap-2 text-sm">
                    <span className="text-text-tertiary w-16">{row.date}</span>
                    <span className={`font-bold w-20 text-right ${row.type === 'income' ? 'text-green-500' : 'text-red-400'}`}>
                      {row.type === 'income' ? '+' : '-'}¥{row.amount}
                    </span>
                    <input
                      type="text"
                      value={row.merchant}
                      onChange={(e) => handleMerchantChange(index, e.target.value)}
                      placeholder="商户名称"
                      className="clay-input text-xs flex-1 min-w-[100px]"
                    />
                    <input
                      type="text"
                      value={row.note}
                      onChange={(e) => handleNoteChange(index, e.target.value)}
                      placeholder="备注"
                      className="clay-input text-xs flex-1 min-w-[100px]"
                    />
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: `${mainCategory?.color}20` }}
                      >
                        <MainIcon size={16} style={{ color: mainCategory?.color }} />
                      </div>
                      <select
                        value={row.categoryL1}
                        onChange={(e) => handleCategoryChange(index, 'L1', e.target.value)}
                        className="clay-input text-xs w-20"
                      >
                        <option value="">选择大类</option>
                        {mainCategories.map((cat: Category) => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                      {row.categoryL1 && (
                        <select
                          value={row.categoryL2}
                          onChange={(e) => handleCategoryChange(index, 'L2', e.target.value)}
                          className="clay-input text-xs w-20"
                        >
                          <option value="">选择小类</option>
                          {getSubCategories(row.categoryL1).map((cat: Category) => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  </ClayCard>
                );
              })}
            </div>
            <div className="flex gap-4 mt-6">
              <ClayButton className="flex-1" variant="secondary" onClick={() => setStep(2)}>
                返回
              </ClayButton>
            </div>
          </div>
        )}

        {step === 4 && importResult && (
          <div className="text-center py-12">
            <CheckCircle size={64} className="mx-auto mb-4 text-green-500" />
            <h2 className="text-2xl font-bold text-text-primary mb-2">
              成功导入 {importResult.success} 条账单
            </h2>
            {importResult.failed > 0 && (
              <p className="text-red-400 mb-6">
                有 {importResult.failed} 条导入失败
              </p>
            )}
            <div className="flex gap-4 justify-center">
              <ClayButton variant="secondary" onClick={handleReset}>
                继续导入
              </ClayButton>
              <ClayButton onClick={() => navigate('/')}>
                查看账单
              </ClayButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};