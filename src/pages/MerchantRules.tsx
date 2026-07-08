import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClayCard, ClayButton, ClayInput, ClayModal } from '@/components';
import { useMerchantRuleStore, useCategoryStore } from '@/store/useStore';
import { getIcon } from '@/utils/icons';
import type { Category } from '@/types';
import { ArrowLeft, Plus, Edit3, Trash2, Search } from 'lucide-react';

export const MerchantRules = () => {
  const navigate = useNavigate();
  const rules = useMerchantRuleStore((state) => state.rules);
  const addRule = useMerchantRuleStore((state) => state.addRule);
  const updateRule = useMerchantRuleStore((state) => state.updateRule);
  const deleteRule = useMerchantRuleStore((state) => state.deleteRule);
  const getMainCategories = useCategoryStore((state) => state.getMainCategories);
  const getSubCategories = useCategoryStore((state) => state.getSubCategories);
  const getCategoryById = useCategoryStore((state) => state.getCategoryById);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingRule, setEditingRule] = useState<string | null>(null);
  const [deleteRuleId, setDeleteRuleId] = useState<string | null>(null);
  const [newRule, setNewRule] = useState({
    merchantName: '',
    categoryL1: '',
    categoryL2: '',
  });

  const mainCategories = getMainCategories();

  const filteredRules = rules.filter(r => 
    r.merchantName.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => b.useCount - a.useCount);

  const handleSave = () => {
    if (!newRule.merchantName.trim() || !newRule.categoryL1 || !newRule.categoryL2) return;

    if (editingRule) {
      updateRule(editingRule, newRule);
    } else {
      addRule(newRule);
    }

    setShowModal(false);
    setEditingRule(null);
    setNewRule({
      merchantName: '',
      categoryL1: '',
      categoryL2: '',
    });
  };

  const handleEdit = (ruleId: string) => {
    const rule = rules.find(r => r.id === ruleId);
    if (rule) {
      setEditingRule(ruleId);
      setNewRule({
        merchantName: rule.merchantName,
        categoryL1: rule.categoryL1,
        categoryL2: rule.categoryL2,
      });
      setShowModal(true);
    }
  };

  const handleDelete = (ruleId: string) => {
    setDeleteRuleId(ruleId);
  };

  const confirmDelete = () => {
    if (deleteRuleId) {
      deleteRule(deleteRuleId);
      setDeleteRuleId(null);
    }
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
          <h1 className="text-xl font-bold text-text-primary">商户规则库</h1>
          <button 
            className="clay-button w-10 h-10 flex items-center justify-center bg-clay-primary text-white"
            onClick={() => {
              setEditingRule(null);
              setNewRule({ merchantName: '', categoryL1: '', categoryL2: '' });
              setShowModal(true);
            }}
          >
            <Plus size={20} />
          </button>
        </div>

        <ClayCard className="p-3 mb-6 flex items-center gap-3">
          <Search size={18} className="text-text-tertiary" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜索商户名"
            className="flex-1 bg-transparent outline-none text-text-primary"
          />
        </ClayCard>

        <div className="space-y-3">
          {filteredRules.map((rule) => {
            const mainCategory = getCategoryById(rule.categoryL1);
            const subCategory = getCategoryById(rule.categoryL2);
            const Icon = getIcon(mainCategory?.icon || 'other');
            return (
              <ClayCard key={rule.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-text-primary font-medium">{rule.merchantName}</p>
                  <p className="text-text-tertiary text-xs">使用 {rule.useCount} 次</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${mainCategory?.color}20` }}
                    >
                      <Icon size={16} style={{ color: mainCategory?.color }} />
                    </div>
                    <span className="text-text-secondary">
                      {mainCategory?.name} / {subCategory?.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      className="text-text-secondary text-sm"
                      onClick={() => handleEdit(rule.id)}
                    >
                      <Edit3 size={16} />
                    </button>
                    <button 
                      className="text-red-400 text-sm"
                      onClick={() => handleDelete(rule.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </ClayCard>
            );
          })}
        </div>

        {filteredRules.length === 0 && (
          <div className="text-center py-10 text-text-tertiary">
            <p>暂无商户规则</p>
            <ClayButton className="mt-4 px-6 py-2" onClick={() => setShowModal(true)}>
              添加规则
            </ClayButton>
          </div>
        )}
      </div>

      <ClayModal 
        isOpen={!!deleteRuleId} 
        onClose={() => setDeleteRuleId(null)}
        title="确认删除"
      >
        <p className="text-text-secondary mb-4">确定要删除这个商户规则吗？</p>
        <div className="flex gap-4">
          <ClayButton className="flex-1" variant="secondary" onClick={() => setDeleteRuleId(null)}>
            取消
          </ClayButton>
          <ClayButton className="flex-1" variant="warning" onClick={confirmDelete}>
            删除
          </ClayButton>
        </div>
      </ClayModal>

      <ClayModal 
        isOpen={showModal} 
        onClose={() => {
          setShowModal(false);
          setEditingRule(null);
        }}
        title={editingRule ? '编辑规则' : '新增规则'}
      >
        <div className="space-y-4">
          <div>
            <label className="text-text-tertiary text-xs block mb-2">商户名称</label>
            <ClayInput 
              value={newRule.merchantName}
              onChange={(v) => setNewRule({ ...newRule, merchantName: v })}
              placeholder="输入商户名称"
            />
          </div>

          <div>
            <label className="text-text-tertiary text-xs block mb-2">选择大类</label>
            <div className="flex flex-wrap gap-2">
              {mainCategories.map((cat: Category) => {
                const Icon = getIcon(cat.icon);
                return (
                  <button
                    key={cat.id}
                    className={`px-3 py-2 rounded-lg flex items-center gap-2 transition-all ${
                      newRule.categoryL1 === cat.id 
                        ? 'bg-clay-primary text-white' 
                        : 'bg-white text-text-secondary'
                    }`}
                    onClick={() => {
                      setNewRule({ ...newRule, categoryL1: cat.id, categoryL2: '' });
                    }}
                  >
                    <Icon size={14} />
                    <span>{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {newRule.categoryL1 && (
            <div>
              <label className="text-text-tertiary text-xs block mb-2">选择小类</label>
              <div className="flex flex-wrap gap-2">
                {getSubCategories(newRule.categoryL1).map((cat: Category) => {
                  const Icon = getIcon(cat.icon);
                  return (
                    <button
                      key={cat.id}
                      className={`px-3 py-2 rounded-lg flex items-center gap-2 transition-all ${
                        newRule.categoryL2 === cat.id 
                          ? 'bg-clay-primary text-white' 
                          : 'bg-white text-text-secondary'
                      }`}
                      onClick={() => setNewRule({ ...newRule, categoryL2: cat.id })}
                    >
                      <Icon size={14} />
                      <span>{cat.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <ClayButton className="flex-1" variant="secondary" onClick={() => setShowModal(false)}>
              取消
            </ClayButton>
            <ClayButton className="flex-1" onClick={handleSave}>
              确认
            </ClayButton>
          </div>
        </div>
      </ClayModal>
    </div>
  );
};
