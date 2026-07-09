import { Category, MerchantRule, Transaction } from '@/types';

export const defaultCategories: Category[] = [
  { id: 'expense', parentId: 'root', name: '支出', icon: 'expense', color: '#EF4444', sortOrder: 1, type: 'expense' },
  { id: 'income', parentId: 'root', name: '收入', icon: 'income', color: '#22C55E', sortOrder: 2, type: 'income' },
  { id: 'transfer', parentId: 'root', name: '转账', icon: 'transfer', color: '#3B82F6', sortOrder: 3, type: 'transfer' },
  { id: 'borrow', parentId: 'root', name: '借还', icon: 'borrow', color: '#8B5CF6', sortOrder: 4, type: 'borrow' },
  { id: 'reimburse', parentId: 'root', name: '报销', icon: 'reimburse', color: '#F59E0B', sortOrder: 5, type: 'reimburse' },
  { id: 'refund', parentId: 'root', name: '退款', icon: 'refund', color: '#14B8A6', sortOrder: 6, type: 'refund' },
  { id: 'deposit', parentId: 'root', name: '存钱', icon: 'deposit', color: '#6366F1', sortOrder: 7, type: 'deposit' },

  { id: 'food', parentId: 'expense', name: '餐饮', icon: 'food', color: '#F0B86E', sortOrder: 1, type: 'expense' },
  { id: 'food-meals', parentId: 'food', name: '三餐', icon: 'food-lunch', color: '#F0B86E', sortOrder: 1, type: 'expense' },
  { id: 'food-snack', parentId: 'food', name: '零食', icon: 'food-snack', color: '#F0B86E', sortOrder: 2, type: 'expense' },
  { id: 'food-milktea', parentId: 'food', name: '奶茶', icon: 'food-snack', color: '#F0B86E', sortOrder: 3, type: 'expense' },
  { id: 'food-coffee', parentId: 'food', name: '咖啡', icon: 'food-snack', color: '#F0B86E', sortOrder: 4, type: 'expense' },
  { id: 'food-fruit', parentId: 'food', name: '水果', icon: 'food-snack', color: '#F0B86E', sortOrder: 5, type: 'expense' },
  { id: 'food-breakfast', parentId: 'food', name: '早餐', icon: 'food-breakfast', color: '#F0B86E', sortOrder: 6, type: 'expense' },
  { id: 'food-dinner', parentId: 'food', name: '聚餐', icon: 'food-dinner', color: '#F0B86E', sortOrder: 7, type: 'expense' },
  { id: 'food-milk', parentId: 'food', name: '牛奶', icon: 'food-snack', color: '#F0B86E', sortOrder: 8, type: 'expense' },

  { id: 'shopping', parentId: 'expense', name: '购物', icon: 'shopping', color: '#E898B8', sortOrder: 2, type: 'expense' },
  { id: 'shopping-daily', parentId: 'shopping', name: '日常', icon: 'shopping-daily', color: '#E898B8', sortOrder: 1, type: 'expense' },
  { id: 'shopping-clothes', parentId: 'shopping', name: '鞋服', icon: 'shopping-clothes', color: '#E898B8', sortOrder: 2, type: 'expense' },
  { id: 'shopping-electronics', parentId: 'shopping', name: '数码', icon: 'shopping-electronics', color: '#E898B8', sortOrder: 3, type: 'expense' },
  { id: 'shopping-bag', parentId: 'shopping', name: '包包', icon: 'shopping-clothes', color: '#E898B8', sortOrder: 4, type: 'expense' },
  { id: 'shopping-kitchen', parentId: 'shopping', name: '厨房用品', icon: 'shopping-daily', color: '#E898B8', sortOrder: 5, type: 'expense' },
  { id: 'shopping-appliance', parentId: 'shopping', name: '电器', icon: 'shopping-electronics', color: '#E898B8', sortOrder: 6, type: 'expense' },
  { id: 'shopping-material', parentId: 'shopping', name: '物料', icon: 'shopping-daily', color: '#E898B8', sortOrder: 7, type: 'expense' },

  { id: 'transport', parentId: 'expense', name: '交通', icon: 'transport', color: '#7EC8E3', sortOrder: 3, type: 'expense' },
  { id: 'transport-public', parentId: 'transport', name: '公交地铁', icon: 'transport-subway', color: '#7EC8E3', sortOrder: 1, type: 'expense' },
  { id: 'transport-taxi', parentId: 'transport', name: '打车', icon: 'transport-taxi', color: '#7EC8E3', sortOrder: 2, type: 'expense' },
  { id: 'transport-car', parentId: 'transport', name: '私家车', icon: 'transport-taxi', color: '#7EC8E3', sortOrder: 3, type: 'expense' },
  { id: 'transport-bike', parentId: 'transport', name: '共享单车', icon: 'transport-bus', color: '#7EC8E3', sortOrder: 4, type: 'expense' },
  { id: 'transport-plane', parentId: 'transport', name: '飞机', icon: 'transport-travel', color: '#7EC8E3', sortOrder: 5, type: 'expense' },
  { id: 'transport-bus', parentId: 'transport', name: '大巴', icon: 'transport-bus', color: '#7EC8E3', sortOrder: 6, type: 'expense' },
  { id: 'transport-train', parentId: 'transport', name: '火车', icon: 'transport-travel', color: '#7EC8E3', sortOrder: 7, type: 'expense' },
  { id: 'transport-fuel', parentId: 'transport', name: '加油', icon: 'transport-fuel', color: '#7EC8E3', sortOrder: 8, type: 'expense' },

  { id: 'accommodation', parentId: 'expense', name: '住宿', icon: 'accommodation', color: '#81C7A8', sortOrder: 4, type: 'expense' },
  { id: 'accommodation-rent', parentId: 'accommodation', name: '房租', icon: 'accommodation-rent', color: '#81C7A8', sortOrder: 1, type: 'expense' },
  { id: 'accommodation-utility', parentId: 'accommodation', name: '物业水电', icon: 'accommodation-utility', color: '#81C7A8', sortOrder: 2, type: 'expense' },
  { id: 'accommodation-repair', parentId: 'accommodation', name: '维修', icon: 'accommodation-utility', color: '#81C7A8', sortOrder: 3, type: 'expense' },

  { id: 'daily', parentId: 'expense', name: '日常', icon: 'shopping-daily', color: '#9CA3AF', sortOrder: 5, type: 'expense' },
  { id: 'daily-express', parentId: 'daily', name: '快递', icon: 'shopping-daily', color: '#9CA3AF', sortOrder: 1, type: 'expense' },
  { id: 'daily-haircut', parentId: 'daily', name: '理发', icon: 'beauty-hair', color: '#9CA3AF', sortOrder: 2, type: 'expense' },

  { id: 'study', parentId: 'expense', name: '学习', icon: 'study', color: '#A8E6CF', sortOrder: 6, type: 'expense' },
  { id: 'study-online', parentId: 'study', name: '网课', icon: 'study-course', color: '#A8E6CF', sortOrder: 1, type: 'expense' },
  { id: 'study-book', parentId: 'study', name: '书籍', icon: 'study-book', color: '#A8E6CF', sortOrder: 2, type: 'expense' },
  { id: 'study-training', parentId: 'study', name: '培训', icon: 'study-course', color: '#A8E6CF', sortOrder: 3, type: 'expense' },
  { id: 'study-competition', parentId: 'study', name: '比赛', icon: 'study-exam', color: '#A8E6CF', sortOrder: 4, type: 'expense' },
  { id: 'study-material', parentId: 'study', name: '资料', icon: 'study-stationery', color: '#A8E6CF', sortOrder: 5, type: 'expense' },

  { id: 'social', parentId: 'expense', name: '人情', icon: 'social', color: '#9FA8DA', sortOrder: 7, type: 'expense' },
  { id: 'social-gift', parentId: 'social', name: '送礼', icon: 'social-gift', color: '#9FA8DA', sortOrder: 1, type: 'expense' },
  { id: 'social-redpacket', parentId: 'social', name: '发红包', icon: 'social-gift', color: '#9FA8DA', sortOrder: 2, type: 'expense' },
  { id: 'social-family', parentId: 'social', name: '孝心', icon: 'social-party', color: '#9FA8DA', sortOrder: 3, type: 'expense' },
  { id: 'social-treat', parentId: 'social', name: '请客', icon: 'social-party', color: '#9FA8DA', sortOrder: 4, type: 'expense' },
  { id: 'social-pay', parentId: 'social', name: '亲密付', icon: 'social-party', color: '#9FA8DA', sortOrder: 5, type: 'expense' },

  { id: 'entertainment', parentId: 'expense', name: '娱乐', icon: 'social', color: '#FBBF24', sortOrder: 8, type: 'expense' },
  { id: 'entertainment-leisure', parentId: 'entertainment', name: '休闲', icon: 'social-party', color: '#FBBF24', sortOrder: 1, type: 'expense' },
  { id: 'entertainment-movie', parentId: 'entertainment', name: '电影', icon: 'social-entertainment', color: '#FBBF24', sortOrder: 2, type: 'expense' },
  { id: 'entertainment-fitness', parentId: 'entertainment', name: '健身', icon: 'membership-fitness', color: '#FBBF24', sortOrder: 3, type: 'expense' },
  { id: 'entertainment-date', parentId: 'entertainment', name: '约会', icon: 'social-party', color: '#FBBF24', sortOrder: 4, type: 'expense' },
  { id: 'entertainment-game', parentId: 'entertainment', name: '游戏', icon: 'social-game', color: '#FBBF24', sortOrder: 5, type: 'expense' },
  { id: 'entertainment-concert', parentId: 'entertainment', name: '演唱会', icon: 'social-entertainment', color: '#FBBF24', sortOrder: 6, type: 'expense' },

  { id: 'beauty', parentId: 'expense', name: '美妆', icon: 'beauty', color: '#F472B6', sortOrder: 9, type: 'expense' },
  { id: 'beauty-cleanser', parentId: 'beauty', name: '洗面奶', icon: 'beauty-skincare', color: '#F472B6', sortOrder: 1, type: 'expense' },
  { id: 'beauty-cosmetics', parentId: 'beauty', name: '化妆品', icon: 'beauty-makeup', color: '#F472B6', sortOrder: 2, type: 'expense' },
  { id: 'beauty-mask', parentId: 'beauty', name: '面膜', icon: 'beauty-skincare', color: '#F472B6', sortOrder: 3, type: 'expense' },
  { id: 'beauty-care', parentId: 'beauty', name: '护理', icon: 'beauty-skincare', color: '#F472B6', sortOrder: 4, type: 'expense' },

  { id: 'travel', parentId: 'expense', name: '旅游', icon: 'travel', color: '#06B6D4', sortOrder: 10, type: 'expense' },
  { id: 'travel-ticket', parentId: 'travel', name: '景点门票', icon: 'travel-ticket', color: '#06B6D4', sortOrder: 1, type: 'expense' },
  { id: 'travel-hotel', parentId: 'travel', name: '酒店', icon: 'accommodation-hotel', color: '#06B6D4', sortOrder: 2, type: 'expense' },
  { id: 'travel-group', parentId: 'travel', name: '团费', icon: 'travel-group', color: '#06B6D4', sortOrder: 3, type: 'expense' },
  { id: 'travel-gift', parentId: 'travel', name: '伴手礼', icon: 'social-gift', color: '#06B6D4', sortOrder: 4, type: 'expense' },

  { id: 'medical', parentId: 'expense', name: '医疗', icon: 'medical', color: '#F4A4A4', sortOrder: 11, type: 'expense' },
  { id: 'medical-drug', parentId: 'medical', name: '药品', icon: 'medical-drug', color: '#F4A4A4', sortOrder: 1, type: 'expense' },
  { id: 'medical-treatment', parentId: 'medical', name: '治疗', icon: 'medical-hospital', color: '#F4A4A4', sortOrder: 2, type: 'expense' },
  { id: 'medical-consult', parentId: 'medical', name: '就诊', icon: 'medical-hospital', color: '#F4A4A4', sortOrder: 3, type: 'expense' },
  { id: 'medical-hospital', parentId: 'medical', name: '住院', icon: 'medical-hospital', color: '#F4A4A4', sortOrder: 4, type: 'expense' },
  { id: 'medical-health', parentId: 'medical', name: '保健', icon: 'medical-drug', color: '#F4A4A4', sortOrder: 5, type: 'expense' },
  { id: 'medical-checkup', parentId: 'medical', name: '体检', icon: 'medical-checkup', color: '#F4A4A4', sortOrder: 6, type: 'expense' },

  { id: 'membership', parentId: 'expense', name: '会员/通讯', icon: 'membership', color: '#8B5CF6', sortOrder: 12, type: 'expense' },
  { id: 'membership-video', parentId: 'membership', name: '视频会员', icon: 'membership-video', color: '#8B5CF6', sortOrder: 1, type: 'expense' },
  { id: 'membership-book', parentId: 'membership', name: '书籍会员', icon: 'membership-video', color: '#8B5CF6', sortOrder: 2, type: 'expense' },
  { id: 'membership-shopping', parentId: 'membership', name: '购物会员', icon: 'membership-video', color: '#8B5CF6', sortOrder: 3, type: 'expense' },
  { id: 'membership-social', parentId: 'membership', name: '社交会员', icon: 'membership-video', color: '#8B5CF6', sortOrder: 4, type: 'expense' },
  { id: 'membership-phone', parentId: 'membership', name: '话费', icon: 'membership-video', color: '#8B5CF6', sortOrder: 5, type: 'expense' },
  { id: 'membership-internet', parentId: 'membership', name: '宽带', icon: 'membership-video', color: '#8B5CF6', sortOrder: 6, type: 'expense' },
  { id: 'membership-tech', parentId: 'membership', name: '科技', icon: 'membership-video', color: '#8B5CF6', sortOrder: 7, type: 'expense' },

  { id: 'other-expense', parentId: 'expense', name: '其他支出', icon: 'other-expense', color: '#CBD5E0', sortOrder: 13, type: 'expense' },

  { id: 'salary', parentId: 'income', name: '工资', icon: 'salary', color: '#4CAF50', sortOrder: 1, type: 'income' },
  { id: 'salary-monthly', parentId: 'salary', name: '月薪', icon: 'salary-monthly', color: '#4CAF50', sortOrder: 1, type: 'income' },
  { id: 'salary-bonus', parentId: 'salary', name: '奖金', icon: 'salary-bonus', color: '#4CAF50', sortOrder: 2, type: 'income' },

  { id: 'investment', parentId: 'income', name: '理财', icon: 'investment', color: '#66BB6A', sortOrder: 2, type: 'income' },
  { id: 'investment-fund', parentId: 'investment', name: '基金收益', icon: 'investment-fund', color: '#66BB6A', sortOrder: 1, type: 'income' },
  { id: 'investment-stock', parentId: 'investment', name: '股票收益', icon: 'investment-stock', color: '#66BB6A', sortOrder: 2, type: 'income' },
  { id: 'investment-deposit', parentId: 'investment', name: '存款利息', icon: 'investment-deposit', color: '#66BB6A', sortOrder: 3, type: 'income' },

  { id: 'part-time', parentId: 'income', name: '兼职', icon: 'part-time', color: '#81C784', sortOrder: 3, type: 'income' },
  { id: 'part-time-freelance', parentId: 'part-time', name: '自由职业', icon: 'part-time-freelance', color: '#81C784', sortOrder: 1, type: 'income' },
  { id: 'part-time-gig', parentId: 'part-time', name: '副业', icon: 'part-time-gig', color: '#81C784', sortOrder: 2, type: 'income' },

  { id: 'gift-income', parentId: 'income', name: '礼金', icon: 'gift-income', color: '#A5D6A7', sortOrder: 4, type: 'income' },
  { id: 'gift-income-redpacket', parentId: 'gift-income', name: '红包收入', icon: 'gift-income-redpacket', color: '#A5D6A7', sortOrder: 1, type: 'income' },
  { id: 'gift-income-birthday', parentId: 'gift-income', name: '生日礼物', icon: 'gift-income-birthday', color: '#A5D6A7', sortOrder: 2, type: 'income' },

  { id: 'other-income', parentId: 'income', name: '其他收入', icon: 'other-income', color: '#C8E6C9', sortOrder: 5, type: 'income' },

  { id: 'transfer-out', parentId: 'transfer', name: '转出', icon: 'transfer-out', color: '#3B82F6', sortOrder: 1, type: 'transfer' },
  { id: 'transfer-in', parentId: 'transfer', name: '转入', icon: 'transfer-in', color: '#3B82F6', sortOrder: 2, type: 'transfer' },

  { id: 'borrow-lend', parentId: 'borrow', name: '借出', icon: 'borrow-lend', color: '#8B5CF6', sortOrder: 1, type: 'borrow' },
  { id: 'borrow-borrow', parentId: 'borrow', name: '借入', icon: 'borrow-borrow', color: '#8B5CF6', sortOrder: 2, type: 'borrow' },
  { id: 'borrow-repay', parentId: 'borrow', name: '还款', icon: 'borrow-repay', color: '#8B5CF6', sortOrder: 3, type: 'borrow' },

  { id: 'reimburse-apply', parentId: 'reimburse', name: '申请报销', icon: 'reimburse-apply', color: '#F59E0B', sortOrder: 1, type: 'reimburse' },
  { id: 'reimburse-receive', parentId: 'reimburse', name: '收到报销', icon: 'reimburse-receive', color: '#F59E0B', sortOrder: 2, type: 'reimburse' },

  { id: 'refund-product', parentId: 'refund', name: '商品退款', icon: 'refund-product', color: '#14B8A6', sortOrder: 1, type: 'refund' },
  { id: 'refund-service', parentId: 'refund', name: '服务退款', icon: 'refund-service', color: '#14B8A6', sortOrder: 2, type: 'refund' },

  { id: 'deposit-savings', parentId: 'deposit', name: '存入储蓄', icon: 'deposit-savings', color: '#6366F1', sortOrder: 1, type: 'deposit' },
  { id: 'deposit-investment', parentId: 'deposit', name: '存入理财', icon: 'deposit-investment', color: '#6366F1', sortOrder: 2, type: 'deposit' },
];

export const defaultMerchantRules: MerchantRule[] = [
  { id: 'm1', merchantName: '美团外卖', categoryL1: 'food', categoryL2: 'food-takeout', useCount: 0 },
  { id: 'm2', merchantName: '美团优选', categoryL1: 'food', categoryL2: 'food-snack', useCount: 0 },
  { id: 'm3', merchantName: '美团买菜', categoryL1: 'food', categoryL2: 'food-dinner', useCount: 0 },
  { id: 'm4', merchantName: '美团', categoryL1: 'food', categoryL2: 'food-lunch', useCount: 0 },
  { id: 'm5', merchantName: '饿了么', categoryL1: 'food', categoryL2: 'food-takeout', useCount: 0 },
  { id: 'm6', merchantName: '星巴克', categoryL1: 'food', categoryL2: 'food-snack', useCount: 0 },
  { id: 'm7', merchantName: '肯德基', categoryL1: 'food', categoryL2: 'food-lunch', useCount: 0 },
  { id: 'm8', merchantName: '麦当劳', categoryL1: 'food', categoryL2: 'food-lunch', useCount: 0 },
  { id: 'm9', merchantName: '瑞幸', categoryL1: 'food', categoryL2: 'food-snack', useCount: 0 },
  { id: 'm10', merchantName: '喜茶', categoryL1: 'food', categoryL2: 'food-snack', useCount: 0 },
  { id: 'm11', merchantName: '奈雪的茶', categoryL1: 'food', categoryL2: 'food-snack', useCount: 0 },
  { id: 'm12', merchantName: '海底捞', categoryL1: 'food', categoryL2: 'food-dinner', useCount: 0 },
  { id: 'm13', merchantName: '小龙坎', categoryL1: 'food', categoryL2: 'food-dinner', useCount: 0 },
  { id: 'm14', merchantName: '太二', categoryL1: 'food', categoryL2: 'food-dinner', useCount: 0 },
  { id: 'm15', merchantName: '西贝', categoryL1: 'food', categoryL2: 'food-dinner', useCount: 0 },
  { id: 'm16', merchantName: '外婆家', categoryL1: 'food', categoryL2: 'food-dinner', useCount: 0 },
  { id: 'm17', merchantName: '绿茶', categoryL1: 'food', categoryL2: 'food-dinner', useCount: 0 },
  { id: 'm18', merchantName: '餐厅', categoryL1: 'food', categoryL2: 'food-dinner', useCount: 0 },
  { id: 'm19', merchantName: '饭店', categoryL1: 'food', categoryL2: 'food-dinner', useCount: 0 },
  { id: 'm20', merchantName: '小吃', categoryL1: 'food', categoryL2: 'food-snack', useCount: 0 },
  { id: 'm21', merchantName: '早餐', categoryL1: 'food', categoryL2: 'food-breakfast', useCount: 0 },
  { id: 'm22', merchantName: '午餐', categoryL1: 'food', categoryL2: 'food-lunch', useCount: 0 },
  { id: 'm23', merchantName: '晚餐', categoryL1: 'food', categoryL2: 'food-dinner', useCount: 0 },
  { id: 'm24', merchantName: '早茶', categoryL1: 'food', categoryL2: 'food-breakfast', useCount: 0 },
  { id: 'm25', merchantName: '下午茶', categoryL1: 'food', categoryL2: 'food-snack', useCount: 0 },
  { id: 'm26', merchantName: '咖啡', categoryL1: 'food', categoryL2: 'food-snack', useCount: 0 },

  { id: 't1', merchantName: '滴滴出行', categoryL1: 'transport', categoryL2: 'transport-taxi', useCount: 0 },
  { id: 't2', merchantName: '滴滴', categoryL1: 'transport', categoryL2: 'transport-taxi', useCount: 0 },
  { id: 't3', merchantName: '高德打车', categoryL1: 'transport', categoryL2: 'transport-taxi', useCount: 0 },
  { id: 't4', merchantName: '首汽约车', categoryL1: 'transport', categoryL2: 'transport-taxi', useCount: 0 },
  { id: 't5', merchantName: '曹操出行', categoryL1: 'transport', categoryL2: 'transport-taxi', useCount: 0 },
  { id: 't6', merchantName: '出租车', categoryL1: 'transport', categoryL2: 'transport-taxi', useCount: 0 },
  { id: 't7', merchantName: '出租', categoryL1: 'transport', categoryL2: 'transport-taxi', useCount: 0 },
  { id: 't8', merchantName: '地铁', categoryL1: 'transport', categoryL2: 'transport-subway', useCount: 0 },
  { id: 't9', merchantName: '公交', categoryL1: 'transport', categoryL2: 'transport-bus', useCount: 0 },
  { id: 't10', merchantName: '高铁', categoryL1: 'transport', categoryL2: 'transport-travel', useCount: 0 },
  { id: 't11', merchantName: '火车', categoryL1: 'transport', categoryL2: 'transport-travel', useCount: 0 },
  { id: 't12', merchantName: '机票', categoryL1: 'transport', categoryL2: 'transport-travel', useCount: 0 },
  { id: 't13', merchantName: '航空', categoryL1: 'transport', categoryL2: 'transport-travel', useCount: 0 },
  { id: 't14', merchantName: '中石化', categoryL1: 'transport', categoryL2: 'transport-fuel', useCount: 0 },
  { id: 't15', merchantName: '中石油', categoryL1: 'transport', categoryL2: 'transport-fuel', useCount: 0 },
  { id: 't16', merchantName: '加油', categoryL1: 'transport', categoryL2: 'transport-fuel', useCount: 0 },
  { id: 't17', merchantName: '停车', categoryL1: 'transport', categoryL2: 'transport-fuel', useCount: 0 },

  { id: 's1', merchantName: '淘宝', categoryL1: 'shopping', categoryL2: 'shopping-daily', useCount: 0 },
  { id: 's2', merchantName: '天猫', categoryL1: 'shopping', categoryL2: 'shopping-daily', useCount: 0 },
  { id: 's3', merchantName: '京东', categoryL1: 'shopping', categoryL2: 'shopping-electronics', useCount: 0 },
  { id: 's4', merchantName: '京东到家', categoryL1: 'shopping', categoryL2: 'shopping-daily', useCount: 0 },
  { id: 's5', merchantName: '拼多多', categoryL1: 'shopping', categoryL2: 'shopping-daily', useCount: 0 },
  { id: 's6', merchantName: '唯品会', categoryL1: 'shopping', categoryL2: 'shopping-clothes', useCount: 0 },
  { id: 's7', merchantName: '小红书', categoryL1: 'beauty', categoryL2: 'beauty-skincare', useCount: 0 },
  { id: 's8', merchantName: '抖音电商', categoryL1: 'shopping', categoryL2: 'shopping-daily', useCount: 0 },
  { id: 's9', merchantName: '快手小店', categoryL1: 'shopping', categoryL2: 'shopping-daily', useCount: 0 },
  { id: 's10', merchantName: '苏宁', categoryL1: 'shopping', categoryL2: 'shopping-electronics', useCount: 0 },
  { id: 's11', merchantName: '超市', categoryL1: 'shopping', categoryL2: 'shopping-daily', useCount: 0 },
  { id: 's12', merchantName: '便利店', categoryL1: 'shopping', categoryL2: 'shopping-daily', useCount: 0 },
  { id: 's13', merchantName: '屈臣氏', categoryL1: 'beauty', categoryL2: 'beauty-skincare', useCount: 0 },
  { id: 's14', merchantName: '丝芙兰', categoryL1: 'beauty', categoryL2: 'beauty-makeup', useCount: 0 },
  { id: 's15', merchantName: '优衣库', categoryL1: 'shopping', categoryL2: 'shopping-clothes', useCount: 0 },
  { id: 's16', merchantName: 'ZARA', categoryL1: 'shopping', categoryL2: 'shopping-clothes', useCount: 0 },
  { id: 's17', merchantName: 'H&M', categoryL1: 'shopping', categoryL2: 'shopping-clothes', useCount: 0 },
  { id: 's18', merchantName: '无印良品', categoryL1: 'shopping', categoryL2: 'shopping-daily', useCount: 0 },
  { id: 's19', merchantName: '名创优品', categoryL1: 'shopping', categoryL2: 'shopping-daily', useCount: 0 },
  { id: 's20', merchantName: '孩子王', categoryL1: 'shopping', categoryL2: 'shopping-baby', useCount: 0 },
  { id: 's21', merchantName: '贝贝', categoryL1: 'shopping', categoryL2: 'shopping-baby', useCount: 0 },
  { id: 's22', merchantName: '当当', categoryL1: 'shopping', categoryL2: 'shopping-stationery', useCount: 0 },

  { id: 'e1', merchantName: '电影', categoryL1: 'social', categoryL2: 'social-entertainment', useCount: 0 },
  { id: 'e2', merchantName: '影城', categoryL1: 'social', categoryL2: 'social-entertainment', useCount: 0 },
  { id: 'e3', merchantName: '影院', categoryL1: 'social', categoryL2: 'social-entertainment', useCount: 0 },
  { id: 'e4', merchantName: '游戏', categoryL1: 'social', categoryL2: 'social-game', useCount: 0 },
  { id: 'e5', merchantName: '腾讯游戏', categoryL1: 'social', categoryL2: 'social-game', useCount: 0 },
  { id: 'e6', merchantName: '网易游戏', categoryL1: 'social', categoryL2: 'social-game', useCount: 0 },
  { id: 'e7', merchantName: '王者荣耀', categoryL1: 'social', categoryL2: 'social-game', useCount: 0 },
  { id: 'e8', merchantName: '和平精英', categoryL1: 'social', categoryL2: 'social-game', useCount: 0 },
  { id: 'e9', merchantName: '旅游', categoryL1: 'travel', categoryL2: 'travel-group', useCount: 0 },
  { id: 'e10', merchantName: '携程', categoryL1: 'travel', categoryL2: 'travel-group', useCount: 0 },
  { id: 'e11', merchantName: '飞猪', categoryL1: 'travel', categoryL2: 'travel-group', useCount: 0 },
  { id: 'e12', merchantName: '去哪儿', categoryL1: 'travel', categoryL2: 'travel-group', useCount: 0 },
  { id: 'e13', merchantName: '同程', categoryL1: 'travel', categoryL2: 'travel-group', useCount: 0 },
  { id: 'e14', merchantName: '酒店', categoryL1: 'travel', categoryL2: 'travel-group', useCount: 0 },
  { id: 'e15', merchantName: '民宿', categoryL1: 'travel', categoryL2: 'travel-group', useCount: 0 },
  { id: 'e16', merchantName: '运动', categoryL1: 'social', categoryL2: 'social-game', useCount: 0 },
  { id: 'e17', merchantName: '健身房', categoryL1: 'membership', categoryL2: 'membership-fitness', useCount: 0 },
  { id: 'e18', merchantName: '美团运动', categoryL1: 'social', categoryL2: 'social-game', useCount: 0 },
  { id: 'e19', merchantName: 'KTV', categoryL1: 'social', categoryL2: 'social-entertainment', useCount: 0 },
  { id: 'e20', merchantName: '酒吧', categoryL1: 'social', categoryL2: 'social-entertainment', useCount: 0 },

  { id: 'l1', merchantName: '房租', categoryL1: 'accommodation', categoryL2: 'accommodation-rent', useCount: 0 },
  { id: 'l2', merchantName: '租金', categoryL1: 'accommodation', categoryL2: 'accommodation-rent', useCount: 0 },
  { id: 'l3', merchantName: '水费', categoryL1: 'accommodation', categoryL2: 'accommodation-utility', useCount: 0 },
  { id: 'l4', merchantName: '电费', categoryL1: 'accommodation', categoryL2: 'accommodation-utility', useCount: 0 },
  { id: 'l5', merchantName: '燃气', categoryL1: 'accommodation', categoryL2: 'accommodation-utility', useCount: 0 },
  { id: 'l6', merchantName: '宽带', categoryL1: 'accommodation', categoryL2: 'accommodation-utility', useCount: 0 },
  { id: 'l7', merchantName: '网费', categoryL1: 'accommodation', categoryL2: 'accommodation-utility', useCount: 0 },
  { id: 'l8', merchantName: '物业', categoryL1: 'accommodation', categoryL2: 'accommodation-property', useCount: 0 },
  { id: 'l9', merchantName: '取暖', categoryL1: 'accommodation', categoryL2: 'accommodation-utility', useCount: 0 },

  { id: 'med1', merchantName: '医院', categoryL1: 'medical', categoryL2: 'medical-hospital', useCount: 0 },
  { id: 'med2', merchantName: '门诊', categoryL1: 'medical', categoryL2: 'medical-hospital', useCount: 0 },
  { id: 'med3', merchantName: '挂号', categoryL1: 'medical', categoryL2: 'medical-hospital', useCount: 0 },
  { id: 'med4', merchantName: '药店', categoryL1: 'medical', categoryL2: 'medical-drug', useCount: 0 },
  { id: 'med5', merchantName: '药房', categoryL1: 'medical', categoryL2: 'medical-drug', useCount: 0 },
  { id: 'med6', merchantName: '美团买药', categoryL1: 'medical', categoryL2: 'medical-drug', useCount: 0 },
  { id: 'med7', merchantName: '阿里健康', categoryL1: 'medical', categoryL2: 'medical-drug', useCount: 0 },
  { id: 'med8', merchantName: '体检', categoryL1: 'medical', categoryL2: 'medical-checkup', useCount: 0 },

  { id: 'st1', merchantName: '书店', categoryL1: 'study', categoryL2: 'study-book', useCount: 0 },
  { id: 'st2', merchantName: '当当', categoryL1: 'study', categoryL2: 'study-book', useCount: 0 },
  { id: 'st3', merchantName: '京东图书', categoryL1: 'study', categoryL2: 'study-book', useCount: 0 },
  { id: 'st4', merchantName: '得到', categoryL1: 'study', categoryL2: 'study-course', useCount: 0 },
  { id: 'st5', merchantName: '知识星球', categoryL1: 'study', categoryL2: 'study-course', useCount: 0 },
  { id: 'st6', merchantName: '极客时间', categoryL1: 'study', categoryL2: 'study-course', useCount: 0 },
  { id: 'st7', merchantName: '慕课', categoryL1: 'study', categoryL2: 'study-course', useCount: 0 },
  { id: 'st8', merchantName: '网易云课堂', categoryL1: 'study', categoryL2: 'study-course', useCount: 0 },
  { id: 'st9', merchantName: '课程', categoryL1: 'study', categoryL2: 'study-course', useCount: 0 },
  { id: 'st10', merchantName: '培训', categoryL1: 'study', categoryL2: 'study-course', useCount: 0 },

  { id: 'sal1', merchantName: '工资', categoryL1: 'salary', categoryL2: 'salary-monthly', useCount: 0 },
  { id: 'sal2', merchantName: '奖金', categoryL1: 'salary', categoryL2: 'salary-bonus', useCount: 0 },
  { id: 'sal3', merchantName: '绩效', categoryL1: 'salary', categoryL2: 'salary-bonus', useCount: 0 },

  { id: 'inv1', merchantName: '基金', categoryL1: 'investment', categoryL2: 'investment-fund', useCount: 0 },
  { id: 'inv2', merchantName: '股票', categoryL1: 'investment', categoryL2: 'investment-stock', useCount: 0 },
  { id: 'inv3', merchantName: '利息', categoryL1: 'investment', categoryL2: 'investment-deposit', useCount: 0 },
  { id: 'inv4', merchantName: '理财', categoryL1: 'investment', categoryL2: 'investment-fund', useCount: 0 },

  { id: 'pt1', merchantName: '兼职', categoryL1: 'part-time', categoryL2: 'part-time-gig', useCount: 0 },
  { id: 'pt2', merchantName: '自由职业', categoryL1: 'part-time', categoryL2: 'part-time-freelance', useCount: 0 },

  { id: 'g1', merchantName: '红包', categoryL1: 'social', categoryL2: 'social-gift', useCount: 0 },
  { id: 'g2', merchantName: '礼金', categoryL1: 'social', categoryL2: 'social-gift', useCount: 0 },
  { id: 'g3', merchantName: '生日', categoryL1: 'gift-income', categoryL2: 'gift-income-birthday', useCount: 0 },

  { id: 'r1', merchantName: '退款', categoryL1: 'refund', categoryL2: 'refund-product', useCount: 0 },
  { id: 'r2', merchantName: '退回', categoryL1: 'refund', categoryL2: 'refund-product', useCount: 0 },

  { id: 'mem1', merchantName: '视频会员', categoryL1: 'membership', categoryL2: 'membership-video', useCount: 0 },
  { id: 'mem2', merchantName: '腾讯视频', categoryL1: 'membership', categoryL2: 'membership-video', useCount: 0 },
  { id: 'mem3', merchantName: '爱奇艺', categoryL1: 'membership', categoryL2: 'membership-video', useCount: 0 },
  { id: 'mem4', merchantName: '优酷', categoryL1: 'membership', categoryL2: 'membership-video', useCount: 0 },
  { id: 'mem5', merchantName: '音乐会员', categoryL1: 'membership', categoryL2: 'membership-music', useCount: 0 },
  { id: 'mem6', merchantName: '网易云音乐', categoryL1: 'membership', categoryL2: 'membership-music', useCount: 0 },
  { id: 'mem7', merchantName: 'QQ音乐', categoryL1: 'membership', categoryL2: 'membership-music', useCount: 0 },
  { id: 'mem8', merchantName: '健身', categoryL1: 'membership', categoryL2: 'membership-fitness', useCount: 0 },
];

export const billCategoryMapping: Record<string, { categoryL1: string; categoryL2: string }> = {
  // === 餐饮美食类 ===
  '餐饮美食': { categoryL1: 'food', categoryL2: 'food-dinner' },
  '食品饮料': { categoryL1: 'food', categoryL2: 'food-snack' },
  '饮食': { categoryL1: 'food', categoryL2: 'food-dinner' },
  '甜品饮品': { categoryL1: 'food', categoryL2: 'food-snack' },
  '外卖': { categoryL1: 'food', categoryL2: 'food-takeout' },
  '早午晚餐': { categoryL1: 'food', categoryL2: 'food-dinner' },

  // === 购物消费类 ===
  '购物消费': { categoryL1: 'shopping', categoryL2: 'shopping-daily' },
  '日用百货': { categoryL1: 'shopping', categoryL2: 'shopping-daily' },
  '服饰装扮': { categoryL1: 'shopping', categoryL2: 'shopping-clothes' },
  '服饰': { categoryL1: 'shopping', categoryL2: 'shopping-clothes' },
  '服装': { categoryL1: 'shopping', categoryL2: 'shopping-clothes' },
  '鞋包饰品': { categoryL1: 'shopping', categoryL2: 'shopping-clothes' },
  '数码电器': { categoryL1: 'shopping', categoryL2: 'shopping-electronics' },
  '数码': { categoryL1: 'shopping', categoryL2: 'shopping-electronics' },
  '母婴用品': { categoryL1: 'shopping', categoryL2: 'shopping-baby' },
  '超市便利': { categoryL1: 'shopping', categoryL2: 'shopping-daily' },
  '便利店': { categoryL1: 'shopping', categoryL2: 'shopping-daily' },

  // === 交通出行类 ===
  '交通出行': { categoryL1: 'transport', categoryL2: 'transport-taxi' },
  '出行': { categoryL1: 'transport', categoryL2: 'transport-taxi' },

  // === 居家生活类 ===
  '居家生活': { categoryL1: 'accommodation', categoryL2: 'accommodation-rent' },
  '家居家装': { categoryL1: 'accommodation', categoryL2: 'accommodation-rent' },
  '家装建材': { categoryL1: 'accommodation', categoryL2: 'accommodation-rent' },
  '物业': { categoryL1: 'accommodation', categoryL2: 'accommodation-property' },
  '水电煤': { categoryL1: 'accommodation', categoryL2: 'accommodation-utility' },

  // === 休闲娱乐类 ===
  '休闲娱乐': { categoryL1: 'social', categoryL2: 'social-entertainment' },
  '电影演出': { categoryL1: 'social', categoryL2: 'social-entertainment' },
  '游戏': { categoryL1: 'social', categoryL2: 'social-game' },
  'KTV': { categoryL1: 'social', categoryL2: 'social-entertainment' },
  '运动健身': { categoryL1: 'membership', categoryL2: 'membership-fitness' },

  // === 医疗健康类 ===
  '医疗健康': { categoryL1: 'medical', categoryL2: 'medical-hospital' },
  '医疗': { categoryL1: 'medical', categoryL2: 'medical-hospital' },
  '健康': { categoryL1: 'medical', categoryL2: 'medical-checkup' },
  '药店': { categoryL1: 'medical', categoryL2: 'medical-drug' },

  // === 教育学习类 ===
  '教育学习': { categoryL1: 'study', categoryL2: 'study-course' },
  '教育': { categoryL1: 'study', categoryL2: 'study-course' },
  '培训': { categoryL1: 'study', categoryL2: 'study-course' },
  '书籍': { categoryL1: 'study', categoryL2: 'study-book' },
  '文具': { categoryL1: 'study', categoryL2: 'study-stationery' },

  // === 美容美发类 ===
  '美容美发': { categoryL1: 'beauty', categoryL2: 'beauty-hair' },
  '美妆': { categoryL1: 'beauty', categoryL2: 'beauty-skincare' },
  '美发': { categoryL1: 'beauty', categoryL2: 'beauty-hair' },
  '护肤': { categoryL1: 'beauty', categoryL2: 'beauty-skincare' },
  '彩妆': { categoryL1: 'beauty', categoryL2: 'beauty-makeup' },

  // === 充值缴费类 ===
  '充值缴费': { categoryL1: 'accommodation', categoryL2: 'accommodation-utility' },
  '通讯': { categoryL1: 'accommodation', categoryL2: 'accommodation-utility' },
  '话费': { categoryL1: 'accommodation', categoryL2: 'accommodation-utility' },
  '宽带': { categoryL1: 'accommodation', categoryL2: 'accommodation-utility' },

  // === 投资理财类 ===
  '金融理财': { categoryL1: 'investment', categoryL2: 'investment-fund' },
  '投资理财': { categoryL1: 'investment', categoryL2: 'investment-fund' },
  '理财': { categoryL1: 'investment', categoryL2: 'investment-fund' },
  '保险': { categoryL1: 'investment', categoryL2: 'investment-fund' },
  '基金': { categoryL1: 'investment', categoryL2: 'investment-fund' },
  '股票': { categoryL1: 'investment', categoryL2: 'investment-stock' },

  // === 转账红包类 ===
  '转账红包': { categoryL1: 'social', categoryL2: 'social-gift' },
  '红包': { categoryL1: 'social', categoryL2: 'social-gift' },
  '转账': { categoryL1: 'social', categoryL2: 'social-gift' },

  // === 公益类 ===
  '公益': { categoryL1: 'other-expense', categoryL2: 'other-expense' },
  '公益慈善': { categoryL1: 'other-expense', categoryL2: 'other-expense' },
  '爱心捐赠': { categoryL1: 'other-expense', categoryL2: 'other-expense' },

  // === 旅行类 ===
  '旅游': { categoryL1: 'travel', categoryL2: 'travel-group' },
  '旅行': { categoryL1: 'travel', categoryL2: 'travel-group' },
  '酒店住宿': { categoryL1: 'accommodation', categoryL2: 'accommodation-hotel' },

  // === 会员类 ===
  '会员': { categoryL1: 'membership', categoryL2: 'membership-video' },
  '视频娱乐': { categoryL1: 'membership', categoryL2: 'membership-video' },
  '音乐': { categoryL1: 'membership', categoryL2: 'membership-music' },

  // === 生活服务类 ===
  '生活服务': { categoryL1: 'other-expense', categoryL2: 'other-expense' },
  '快递物流': { categoryL1: 'shopping', categoryL2: 'shopping-daily' },
  '快递': { categoryL1: 'shopping', categoryL2: 'shopping-daily' },

  // === 退款类 ===
  '退款': { categoryL1: 'refund', categoryL2: 'refund-product' },
  '退票': { categoryL1: 'refund', categoryL2: 'refund-service' },

  // === 工资收入类 ===
  '工资': { categoryL1: 'salary', categoryL2: 'salary-monthly' },
  '奖金': { categoryL1: 'salary', categoryL2: 'salary-bonus' },
  '薪资': { categoryL1: 'salary', categoryL2: 'salary-monthly' },
  '兼职': { categoryL1: 'part-time', categoryL2: 'part-time-gig' },
  '利息': { categoryL1: 'investment', categoryL2: 'investment-deposit' },
  '收益': { categoryL1: 'investment', categoryL2: 'investment-fund' },

  // === 其他 ===
  '其他': { categoryL1: 'other-expense', categoryL2: 'other-expense' },
  '其他消费': { categoryL1: 'other-expense', categoryL2: 'other-expense' },
  '其他收入': { categoryL1: 'other-income', categoryL2: 'other-income' },
  '快捷支付': { categoryL1: 'other-expense', categoryL2: 'other-expense' },
  '代扣': { categoryL1: 'other-expense', categoryL2: 'other-expense' },
  '商户服务': { categoryL1: 'other-expense', categoryL2: 'other-expense' },
  '自动扣款': { categoryL1: 'other-expense', categoryL2: 'other-expense' },
};

export const defaultTransactions: Transaction[] = [
  { id: '1', date: '2026-07-08', amount: 35.5, type: 'expense', categoryL1: 'food', categoryL2: 'food-lunch', merchant: '美团外卖', note: '黄焖鸡米饭', source: 'manual', createdAt: '2026-07-08T12:30:00Z' },
  { id: '2', date: '2026-07-08', amount: 15, type: 'expense', categoryL1: 'transport', categoryL2: 'transport-subway', merchant: '地铁', note: '通勤', source: 'manual', createdAt: '2026-07-08T08:00:00Z' },
  { id: '3', date: '2026-07-07', amount: 299, type: 'expense', categoryL1: 'shopping', categoryL2: 'shopping-clothes', merchant: '淘宝', note: '夏季T恤', source: 'manual', createdAt: '2026-07-07T20:15:00Z' },
  { id: '4', date: '2026-07-07', amount: 88, type: 'expense', categoryL1: 'social', categoryL2: 'social-entertainment', merchant: '万达影城', note: '电影票', source: 'manual', createdAt: '2026-07-07T19:00:00Z' },
  { id: '5', date: '2026-07-06', amount: 2000, type: 'income', categoryL1: 'salary', categoryL2: 'salary-monthly', merchant: '工资', note: '七月工资', source: 'manual', createdAt: '2026-07-06T10:00:00Z' },
  { id: '6', date: '2026-07-06', amount: 1500, type: 'expense', categoryL1: 'accommodation', categoryL2: 'accommodation-rent', merchant: '房东', note: '七月房租', source: 'manual', createdAt: '2026-07-06T09:00:00Z' },
  { id: '7', date: '2026-07-05', amount: 45, type: 'expense', categoryL1: 'food', categoryL2: 'food-dinner', merchant: '饿了么', note: '烧烤', source: 'manual', createdAt: '2026-07-05T21:30:00Z' },
  { id: '8', date: '2026-07-05', amount: 28, type: 'expense', categoryL1: 'food', categoryL2: 'food-snack', merchant: '星巴克', note: '拿铁咖啡', source: 'manual', createdAt: '2026-07-05T15:00:00Z' },
];

export const getCategoryById = (categories: Category[], id: string): Category | undefined => {
  return categories.find(c => c.id === id);
};

export const getSubCategories = (categories: Category[], parentId: string): Category[] => {
  return categories.filter(c => c.parentId === parentId).sort((a, b) => a.sortOrder - b.sortOrder);
};

export const getAllCategories = (): Category[] => {
  const stored = localStorage.getItem('categories');
  if (stored) {
    return JSON.parse(stored);
  }
  localStorage.setItem('categories', JSON.stringify(defaultCategories));
  return defaultCategories;
};

export const getAllMerchantRules = (): MerchantRule[] => {
  const stored = localStorage.getItem('merchantRules');
  if (stored) {
    return JSON.parse(stored);
  }
  localStorage.setItem('merchantRules', JSON.stringify(defaultMerchantRules));
  return defaultMerchantRules;
};

export const getAllTransactions = (): Transaction[] => {
  const stored = localStorage.getItem('transactions');
  if (stored) {
    return JSON.parse(stored);
  }
  localStorage.setItem('transactions', JSON.stringify(defaultTransactions));
  return defaultTransactions;
};

export const matchCategoryByMerchant = (merchantName: string, rules: MerchantRule[]): { categoryL1: string; categoryL2: string; ruleId?: string } | null => {
  if (!merchantName || !rules.length) return null;
  
  const normalized = merchantName.trim().toLowerCase();
  let bestMatch: MerchantRule | null = null;
  let bestMatchLength = 0;
  
  for (const rule of rules) {
    const ruleName = rule.merchantName.toLowerCase();
    if (normalized.includes(ruleName)) {
      if (ruleName.length > bestMatchLength) {
        bestMatch = rule;
        bestMatchLength = ruleName.length;
      }
    }
  }
  
  if (bestMatch) {
    return { 
      categoryL1: bestMatch.categoryL1, 
      categoryL2: bestMatch.categoryL2,
      ruleId: bestMatch.id
    };
  }
  return null;
};

export const normalizeMerchant = (raw: string): string => {
  if (!raw) return '';
  
  let name = raw.trim();
  name = name.replace(/^\(特约\)/, '');
  name = name.replace(/^财付通[-_]/, '');
  name = name.replace(/^支付宝[-_]/, '');
  name = name.replace(/^微信支付[-_]/, '');
  name = name.replace(/[-_#]\d{8,}.*$/, '');
  name = name.replace(/订单.*$/, '');
  
  const parts = name.split(/[-_——]/);
  if (parts.length > 1 && parts[0].length <= 10) {
    name = parts[0];
  }
  
  return name.trim();
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};
