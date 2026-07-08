import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClayCard, ClayButton, ClayInput, ClayModal } from '@/components';
import { useCategoryStore } from '@/store/useStore';
import { getIcon, iconMap } from '@/utils/icons';
import type { Category as CategoryType } from '@/types';
import { ArrowLeft, Plus, Edit3, Trash2, ChevronDown, ChevronRight } from 'lucide-react';

const iconKeys = Object.keys(iconMap);
const colorOptions = ['#F0B86E', '#E898B8', '#7EC8E3', '#9FA8DA', '#81C7A8', '#F4A4A4', '#A8E6CF', '#CBD5E0'];

export const Category = () => {
  const navigate = useNavigate();
  const categories = useCategoryStore((state) => state.categories);
  const addCategory = useCategoryStore((state) => state.addCategory);
  const updateCategory = useCategoryStore((state) => state.updateCategory);
  const deleteCategory = useCategoryStore((state) => state.deleteCategory);
  const getMainCategories = useCategoryStore((state) => state.getMainCategories);
  
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState({
    name: '',
    icon: iconKeys[0],
    color: colorOptions[0],
    parentId: 'root',
    sortOrder: 0,
  });

  const mainCategories = getMainCategories();

  const getSubCategories = (parentId: string) => {
    return categories.filter((c: CategoryType) => c.parentId === parentId);
  };

  const handleSave = () => {
    if (!newCategory.name.trim()) return;

    if (editingCategory) {
      updateCategory(editingCategory, newCategory);
    } else {
      addCategory(newCategory);
    }

    setShowModal(false);
    setEditingCategory(null);
    setNewCategory({
      name: '',
      icon: iconKeys[0],
      color: colorOptions[0],
      parentId: 'root',
      sortOrder: 0,
    });
  };

  const handleEdit = (categoryId: string) => {
    const category = categories.find((c: CategoryType) => c.id === categoryId);
    if (category) {
      setEditingCategory(categoryId);
      setNewCategory({
        name: category.name,
        icon: category.icon,
        color: category.color,
        parentId: category.parentId,
        sortOrder: category.sortOrder,
      });
      setShowModal(true);
    }
  };

  const handleDelete = (categoryId: string) => {
    if (confirm('确定要删除这个分类吗？')) {
      deleteCategory(categoryId);
    }
  };

  const handleAddSubCategory = (parentId: string) => {
    setEditingCategory(null);
    setNewCategory({
      name: '',
      icon: iconKeys[0],
      color: colorOptions[0],
      parentId,
      sortOrder: 0,
    });
    setShowModal(true);
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
          <h1 className="text-xl font-bold text-text-primary">分类管理</h1>
          <button 
            className="clay-button w-10 h-10 flex items-center justify-center bg-clay-primary text-white"
            onClick={() => {
              setEditingCategory(null);
              setNewCategory({ name: '', icon: iconKeys[0], color: colorOptions[0], parentId: 'root', sortOrder: 0 });
              setShowModal(true);
            }}
          >
            <Plus size={20} />
          </button>
        </div>

        <div className="space-y-3">
          {mainCategories.map((category: CategoryType) => {
            const subCategories = getSubCategories(category.id);
            const Icon = getIcon(category.icon);
            return (
              <ClayCard key={category.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${category.color}20` }}
                    >
                      <Icon size={20} style={{ color: category.color }} />
                    </div>
                    <span className="text-text-primary font-medium">{category.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      className="text-text-secondary text-sm"
                      onClick={() => handleAddSubCategory(category.id)}
                    >
                      + 添加
                    </button>
                    <button 
                      className="text-text-secondary text-sm"
                      onClick={() => handleEdit(category.id)}
                    >
                      <Edit3 size={16} />
                    </button>
                    <button 
                      className="text-red-400 text-sm"
                      onClick={() => handleDelete(category.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                {subCategories.length > 0 && (
                  <div className="mt-4 ml-13 border-l-2 border-gray-200 pl-4">
                    <div 
                      className="flex items-center justify-between mb-2 cursor-pointer"
                      onClick={() => setExpandedCategory(expandedCategory === category.id ? null : category.id)}
                    >
                      <span className="text-text-tertiary text-sm">小类</span>
                      <span className="text-text-tertiary text-sm">
                        {expandedCategory === category.id ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </span>
                    </div>
                    
                    {expandedCategory === category.id && (
                      <div className="space-y-2">
                        {subCategories.map((sub: CategoryType) => {
                          const SubIcon = getIcon(sub.icon);
                          return (
                            <div 
                              key={sub.id} 
                              className="flex items-center justify-between py-2"
                            >
                              <div className="flex items-center gap-2">
                                <SubIcon size={16} style={{ color: sub.color }} />
                                <span className="text-text-secondary">{sub.name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <button 
                                  className="text-text-tertiary text-xs"
                                  onClick={() => handleEdit(sub.id)}
                                >
                                  编辑
                                </button>
                                <button 
                                  className="text-red-400 text-xs"
                                  onClick={() => handleDelete(sub.id)}
                                >
                                  删除
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </ClayCard>
            );
          })}
        </div>
      </div>

      <ClayModal 
        isOpen={showModal} 
        onClose={() => {
          setShowModal(false);
          setEditingCategory(null);
        }}
        title={editingCategory ? '编辑分类' : '新增分类'}
      >
        <div className="space-y-4">
          <div>
            <label className="text-text-tertiary text-xs block mb-2">分类名称</label>
            <ClayInput 
              value={newCategory.name}
              onChange={(v) => setNewCategory({ ...newCategory, name: v })}
              placeholder="输入分类名称"
            />
          </div>

          <div>
            <label className="text-text-tertiary text-xs block mb-2">选择图标</label>
            <div className="flex flex-wrap gap-2">
              {iconKeys.map((iconKey) => {
                const IconComponent = getIcon(iconKey);
                return (
                  <button
                    key={iconKey}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                      newCategory.icon === iconKey ? 'bg-clay-primary text-white' : 'bg-white'
                    }`}
                    onClick={() => setNewCategory({ ...newCategory, icon: iconKey })}
                  >
                    <IconComponent size={18} />
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-text-tertiary text-xs block mb-2">选择颜色</label>
            <div className="flex gap-2">
              {colorOptions.map((color) => (
                <button
                  key={color}
                  className={`w-8 h-8 rounded-full transition-all ${
                    newCategory.color === color ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setNewCategory({ ...newCategory, color })}
                />
              ))}
            </div>
          </div>

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
