import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ClayCard, ClayButton, ClayModal } from '@/components';
import { useTransactionStore, useCategoryStore, useMerchantRuleStore } from '@/store/useStore';
import { getIcon } from '@/utils/icons';
import { ArrowLeft, Trash2, Store, FileText, Calendar } from 'lucide-react';

const numberKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'del'];

export const AddRecord = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('id');

  const { addTransaction, updateTransaction, deleteTransaction, transactions } = useTransactionStore();
  const { getMainCategories, getSubCategories } = useCategoryStore();
  const { matchMerchant, incrementUseCount, rules } = useMerchantRuleStore();

  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'expense' | 'income' | 'transfer' | 'borrow' | 'reimburse' | 'refund' | 'deposit'>('expense');
  const [categoryL1, setCategoryL1] = useState('');
  const [categoryL2, setCategoryL2] = useState('');
  const [merchant, setMerchant] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const editTransaction = transactions.find(t => t.id === editId);

  useEffect(() => {
    if (editTransaction) {
      setAmount(editTransaction.amount.toString());
      setType(editTransaction.type);
      setCategoryL1(editTransaction.categoryL1);
      setCategoryL2(editTransaction.categoryL2);
      setMerchant(editTransaction.merchant);
      setNote(editTransaction.note);
      setDate(editTransaction.date);
    }
  }, [editTransaction]);

  useEffect(() => {
    if (merchant) {
      const matched = matchMerchant(merchant);
      if (matched && !categoryL1) {
        setCategoryL1(matched.categoryL1);
        setCategoryL2(matched.categoryL2);
      }
    }
  }, [merchant, matchMerchant, categoryL1]);

  const handleNumberClick = (key: string) => {
    if (key === 'del') {
      setAmount(amount.slice(0, -1));
    } else if (key === '.') {
      if (!amount.includes('.')) {
        setAmount(amount + '.');
      }
    } else {
      setAmount(amount + key);
    }
  };

  const handleSave = () => {
    if (!amount || !categoryL1 || !categoryL2) return;

    const transactionData = {
      amount: parseFloat(amount),
      type,
      categoryL1,
      categoryL2,
      merchant,
      note,
      date,
    };

    if (editId) {
      updateTransaction(editId, transactionData);
    } else {
      addTransaction({ ...transactionData, source: 'manual' as const });
      const matchedRule = rules.find(r => merchant.includes(r.merchantName));
      if (matchedRule) {
        incrementUseCount(matchedRule.id);
      }
    }

    navigate('/');
  };

  const handleDelete = () => {
    if (editId) {
      deleteTransaction(editId);
      navigate('/');
    }
  };

  const allCategories = getMainCategories();
  const mainCategories = allCategories.filter(c => c.type === type || !c.type);
  const subCategories = categoryL1 ? getSubCategories(categoryL1).filter(c => c.type === type || !c.type) : [];

  return (
    <div className="min-h-screen bg-clay-bg pb-36">
      <div className="px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <button 
            className="text-text-secondary text-lg"
            onClick={() => navigate('/')}
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-text-primary">
            {editId ? '编辑账单' : '记一笔'}
          </h1>
          {editId && (
            <button 
              className="text-red-400 text-lg"
              onClick={() => setShowDeleteModal(true)}
            >
              <Trash2 size={22} />
            </button>
          )}
        </div>

        <ClayCard className="p-6 mb-6">
          <p className="text-text-tertiary text-sm mb-2">金额</p>
          <p className="text-4xl font-bold text-text-primary mb-4">
            ¥{amount || '0.00'}
          </p>
          <div className="flex gap-4">
            <button
              className={`flex-1 py-3 rounded-xl transition-all ${
                type === 'expense' 
                  ? 'bg-clay-primary text-white shadow-lg' 
                  : 'bg-gray-100 text-text-secondary'
              }`}
              onClick={() => setType('expense')}
            >
              支出
            </button>
            <button
              className={`flex-1 py-3 rounded-xl transition-all ${
                type === 'income' 
                  ? 'bg-clay-secondary text-white shadow-lg' 
                  : 'bg-gray-100 text-text-secondary'
              }`}
              onClick={() => setType('income')}
            >
              收入
            </button>
          </div>
        </ClayCard>

        <div className="mb-6">
          <p className="text-text-secondary text-sm mb-3">选择分类</p>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {mainCategories.map((cat) => {
              const Icon = getIcon(cat.icon);
              return (
                <button
                  key={cat.id}
                  className={`flex flex-col items-center gap-2 px-4 py-3 rounded-xl transition-all ${
                    categoryL1 === cat.id 
                      ? 'bg-clay-primary/20 shadow-lg scale-105' 
                      : 'bg-white'
                  }`}
                  onClick={() => {
                    setCategoryL1(cat.id);
                    setCategoryL2('');
                  }}
                >
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${cat.color}20` }}
                  >
                    <Icon size={24} style={{ color: cat.color }} />
                  </div>
                  <span className="text-sm text-text-primary">{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {categoryL1 && subCategories.length > 0 && (
          <div className="mb-6">
            <p className="text-text-secondary text-sm mb-3">选择小类</p>
            <div className="flex flex-wrap gap-2">
              {subCategories.map((cat) => {
                const Icon = getIcon(cat.icon);
                return (
                  <button
                    key={cat.id}
                    className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                      categoryL2 === cat.id 
                        ? 'bg-clay-primary text-white' 
                        : 'bg-white text-text-secondary'
                    }`}
                    onClick={() => setCategoryL2(cat.id)}
                  >
                    <Icon size={16} />
                    <span>{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <ClayCard className="p-4 mb-4">
          <label className="text-text-tertiary text-xs block mb-2">商户</label>
          <div className="flex items-center gap-2">
            <Store size={18} className="text-text-tertiary" />
            <input
              type="text"
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
              placeholder="输入商户名称"
              className="flex-1 bg-transparent outline-none text-text-primary"
            />
          </div>
        </ClayCard>

        <ClayCard className="p-4 mb-4">
          <label className="text-text-tertiary text-xs block mb-2">备注</label>
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-text-tertiary" />
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="添加备注"
              className="flex-1 bg-transparent outline-none text-text-primary"
            />
          </div>
        </ClayCard>

        <ClayCard className="p-4 mb-6">
          <label className="text-text-tertiary text-xs block mb-2">日期</label>
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-text-tertiary" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="flex-1 bg-transparent outline-none text-text-primary"
            />
          </div>
        </ClayCard>

        <div className="grid grid-cols-3 gap-2">
          {numberKeys.map((key) => (
            <button
              key={key}
              className="clay-button h-16 text-2xl font-bold"
              onClick={() => handleNumberClick(key)}
            >
              {key === 'del' ? '⌫' : key}
            </button>
          ))}
        </div>

        <ClayButton 
          className="w-full py-4 text-lg font-bold mt-6"
          onClick={handleSave}
          disabled={!amount || !categoryL1 || !categoryL2}
        >
          {editId ? '保存修改' : '保存'}
        </ClayButton>
      </div>

      <ClayModal 
        isOpen={showDeleteModal} 
        onClose={() => setShowDeleteModal(false)}
        title="确认删除"
      >
        <p className="text-text-secondary mb-4">确定要删除这条账单吗？</p>
        <div className="flex gap-4">
          <ClayButton className="flex-1" variant="secondary" onClick={() => setShowDeleteModal(false)}>
            取消
          </ClayButton>
          <ClayButton className="flex-1" variant="warning" onClick={handleDelete}>
            删除
          </ClayButton>
        </div>
      </ClayModal>
    </div>
  );
};
