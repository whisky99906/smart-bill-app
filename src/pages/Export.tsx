import { useNavigate } from 'react-router-dom';
import { ClayCard, ClayButton } from '@/components';
import { useTransactionStore } from '@/store/useStore';
import { ArrowLeft, Download, FileSpreadsheet, Check } from 'lucide-react';

export const Export = () => {
  const navigate = useNavigate();
  const { transactions } = useTransactionStore();

  const handleExport = () => {
    const headers = ['日期', '金额', '类型', '大类', '小类', '商户', '备注', '来源'];
    const data = transactions.map(t => [
      t.date,
      t.amount,
      t.type === 'expense' ? '支出' : '收入',
      t.categoryL1,
      t.categoryL2,
      t.merchant,
      t.note,
      t.source === 'manual' ? '手动' : t.source === 'excel' ? 'Excel' : '语音',
    ]);

    const csvContent = [headers.join(','), ...data.map(row => row.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `账单数据_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

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
          <h1 className="text-xl font-bold text-text-primary">数据导出</h1>
          <div className="w-6" />
        </div>

        <ClayCard className="p-6 mb-6 text-center">
          <Download size={48} className="mx-auto mb-4 text-clay-primary" />
          <p className="text-text-primary font-medium mb-2">导出账单数据</p>
          <p className="text-text-tertiary text-sm">
            共 {transactions.length} 条账单记录
          </p>
        </ClayCard>

        <ClayCard className="p-4 mb-4">
          <p className="text-text-secondary text-sm mb-4">导出格式</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileSpreadsheet size={28} className="text-clay-primary" />
              <div>
                <p className="text-text-primary">CSV 文件</p>
                <p className="text-text-tertiary text-xs">支持 Excel 打开</p>
              </div>
            </div>
            <Check size={18} className="text-clay-primary" />
          </div>
        </ClayCard>

        <ClayCard className="p-4 mb-6">
          <p className="text-text-secondary text-sm mb-4">导出范围</p>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-text-primary">全部数据</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="radio" name="exportRange" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-clay-primary"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-primary">本月数据</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="radio" name="exportRange" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-clay-primary"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-primary">自定义时间</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="radio" name="exportRange" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-clay-primary"></div>
              </label>
            </div>
          </div>
        </ClayCard>

        <ClayButton className="w-full py-4 text-lg font-bold" onClick={handleExport}>
          开始导出
        </ClayButton>
      </div>
    </div>
  );
};
