import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { ClayCard, ClayButton, ClayTab } from '@/components';
import { useTransactionStore, useCategoryStore, useMerchantRuleStore } from '@/store/useStore';
import type { Category } from '@/types';
import { ArrowLeft, Upload, CheckCircle } from 'lucide-react';

type FieldType = 'date' | 'amount' | 'merchant' | 'type' | 'note' | 'category' | 'ignore';

interface ParsedRow {
  [key: string]: string;
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

export const ExcelImport = () => {
  const navigate = useNavigate();
  const addTransaction = useTransactionStore((state) => state.addTransaction);
  const getMainCategories = useCategoryStore((state) => state.getMainCategories);
  const getSubCategories = useCategoryStore((state) => state.getSubCategories);
  const matchMerchant = useMerchantRuleStore((state) => state.matchMerchant);
  
  const [step, setStep] = useState(1);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [fullRows, setFullRows] = useState<ParsedRow[]>([]);
  const [fieldMapping, setFieldMapping] = useState<Record<string, FieldType>>({});
  const [importRows, setImportRows] = useState<ImportRow[]>([]);
  const [importResult, setImportResult] = useState<{ success: number; failed: number } | null>(null);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json<ParsedRow>(worksheet);
      
      if (jsonData.length > 0) {
        setHeaders(Object.keys(jsonData[0]));
        setRows(jsonData.slice(0, 50));
        setFullRows(jsonData);
        setStep(2);
      }
    };
    reader.readAsArrayBuffer(selectedFile);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (!droppedFile) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json<ParsedRow>(worksheet);
      
      if (jsonData.length > 0) {
        setHeaders(Object.keys(jsonData[0]));
        setRows(jsonData.slice(0, 50));
        setFullRows(jsonData);
        setStep(2);
      }
    };
    reader.readAsArrayBuffer(droppedFile);
  }, []);

  const handleFieldChange = (header: string, field: FieldType) => {
    setFieldMapping({ ...fieldMapping, [header]: field });
  };

  const handleNextStep = () => {
    const mappedRows: ImportRow[] = fullRows.map((row) => {
      const date = row[headers.find(h => fieldMapping[h] === 'date') || ''] || '';
      const amount = row[headers.find(h => fieldMapping[h] === 'amount') || ''] || '';
      const merchant = row[headers.find(h => fieldMapping[h] === 'merchant') || ''] || '';
      const type = row[headers.find(h => fieldMapping[h] === 'type') || ''] || '';
      const note = row[headers.find(h => fieldMapping[h] === 'note') || ''] || '';

      let categoryL1 = '';
      let categoryL2 = '';
      const matched = matchMerchant(merchant);
      if (matched) {
        categoryL1 = matched.categoryL1;
        categoryL2 = matched.categoryL2;
      }

      return {
        original: row,
        date: formatDate(date),
        amount: formatAmount(amount),
        merchant,
        type: (type.includes('收入') || type.includes('+')) ? 'income' : (type.includes('支出') || type.includes('-')) ? 'expense' : '',
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

  const formatAmount = (amountStr: string): string => {
    if (!amountStr) return '0';
    const match = amountStr.match(/[\d.]+/);
    return match ? match[0] : '0';
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

  const handleImport = () => {
    let success = 0;
    let failed = 0;

    importRows.forEach((row) => {
      if (!row.date || !row.amount || !row.categoryL1 || !row.categoryL2) {
        failed++;
        return;
      }

      try {
        addTransaction({
          date: row.date,
          amount: parseFloat(row.amount),
          type: row.type || 'expense',
          categoryL1: row.categoryL1,
          categoryL2: row.categoryL2,
          merchant: row.merchant,
          note: row.note,
          source: 'excel',
        });
        success++;
      } catch {
        failed++;
      }
    });

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
                onClick={handleNextStep}
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
                共 {importRows.length} 条，已自动分类 {importRows.filter(r => r.categoryL1).length} 条
              </p>
              <ClayButton className="px-4 py-2 text-sm" onClick={handleImport}>
                确认导入
              </ClayButton>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {importRows.map((row, index) => (
                <ClayCard key={index} className="p-3 flex flex-wrap items-center gap-2 text-sm">
                  <span className="text-text-tertiary w-12">{row.date}</span>
                  <span className="text-text-primary flex-1">{row.merchant}</span>
                  <span className={`font-bold ${row.type === 'income' ? 'text-green-500' : 'text-red-400'}`}>
                    ¥{row.amount}
                  </span>
                  <div className="flex items-center gap-2">
                    <select
                      value={row.categoryL1}
                      onChange={(e) => handleCategoryChange(index, 'L1', e.target.value)}
                      className="clay-input text-xs w-24"
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
                        className="clay-input text-xs w-24"
                      >
                        <option value="">选择小类</option>
                        {getSubCategories(row.categoryL1).map((cat: Category) => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    )}
                  </div>
                </ClayCard>
              ))}
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
