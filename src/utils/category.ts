import { Category, MerchantRule, Transaction } from '@/types';

export const defaultCategories: Category[] = [
  { id: 'food', parentId: 'root', name: '三餐', icon: 'food', color: '#F0B86E', sortOrder: 1, type: 'expense' },
  { id: 'food-breakfast', parentId: 'food', name: '早餐', icon: 'food-breakfast', color: '#F0B86E', sortOrder: 1, type: 'expense' },
  { id: 'food-lunch', parentId: 'food', name: '午餐', icon: 'food-lunch', color: '#F0B86E', sortOrder: 2, type: 'expense' },
  { id: 'food-dinner', parentId: 'food', name: '晚餐', icon: 'food-dinner', color: '#F0B86E', sortOrder: 3, type: 'expense' },
  { id: 'food-snack', parentId: 'food', name: '零食', icon: 'food-snack', color: '#F0B86E', sortOrder: 4, type: 'expense' },
  
  { id: 'shopping', parentId: 'root', name: '购物', icon: 'shopping', color: '#E898B8', sortOrder: 2, type: 'expense' },
  { id: 'shopping-clothes', parentId: 'shopping', name: '服装', icon: 'shopping-clothes', color: '#E898B8', sortOrder: 1, type: 'expense' },
  { id: 'shopping-daily', parentId: 'shopping', name: '日用品', icon: 'shopping-daily', color: '#E898B8', sortOrder: 2, type: 'expense' },
  { id: 'shopping-electronics', parentId: 'shopping', name: '数码', icon: 'shopping-electronics', color: '#E898B8', sortOrder: 3, type: 'expense' },
  { id: 'shopping-beauty', parentId: 'shopping', name: '美妆', icon: 'shopping-beauty', color: '#E898B8', sortOrder: 4, type: 'expense' },
  
  { id: 'transport', parentId: 'root', name: '交通', icon: 'transport', color: '#7EC8E3', sortOrder: 3, type: 'expense' },
  { id: 'transport-bus', parentId: 'transport', name: '公交', icon: 'transport-bus', color: '#7EC8E3', sortOrder: 1, type: 'expense' },
  { id: 'transport-subway', parentId: 'transport', name: '地铁', icon: 'transport-subway', color: '#7EC8E3', sortOrder: 2, type: 'expense' },
  { id: 'transport-taxi', parentId: 'transport', name: '打车', icon: 'transport-taxi', color: '#7EC8E3', sortOrder: 3, type: 'expense' },
  { id: 'transport-fuel', parentId: 'transport', name: '加油', icon: 'transport-fuel', color: '#7EC8E3', sortOrder: 4, type: 'expense' },
  
  { id: 'entertainment', parentId: 'root', name: '娱乐', icon: 'entertainment', color: '#9FA8DA', sortOrder: 4, type: 'expense' },
  { id: 'entertainment-movie', parentId: 'entertainment', name: '电影', icon: 'entertainment-movie', color: '#9FA8DA', sortOrder: 1, type: 'expense' },
  { id: 'entertainment-game', parentId: 'entertainment', name: '游戏', icon: 'entertainment-game', color: '#9FA8DA', sortOrder: 2, type: 'expense' },
  { id: 'entertainment-travel', parentId: 'entertainment', name: '旅行', icon: 'entertainment-travel', color: '#9FA8DA', sortOrder: 3, type: 'expense' },
  { id: 'entertainment-sport', parentId: 'entertainment', name: '运动', icon: 'entertainment-sport', color: '#9FA8DA', sortOrder: 4, type: 'expense' },
  
  { id: 'living', parentId: 'root', name: '居住', icon: 'living', color: '#81C7A8', sortOrder: 5, type: 'expense' },
  { id: 'living-rent', parentId: 'living', name: '房租', icon: 'living-rent', color: '#81C7A8', sortOrder: 1, type: 'expense' },
  { id: 'living-water', parentId: 'living', name: '水电', icon: 'living-water', color: '#81C7A8', sortOrder: 2, type: 'expense' },
  { id: 'living-internet', parentId: 'living', name: '网费', icon: 'living-internet', color: '#81C7A8', sortOrder: 3, type: 'expense' },
  
  { id: 'medical', parentId: 'root', name: '医疗', icon: 'medical', color: '#F4A4A4', sortOrder: 6, type: 'expense' },
  { id: 'medical-hospital', parentId: 'medical', name: '看病', icon: 'medical-hospital', color: '#F4A4A4', sortOrder: 1, type: 'expense' },
  { id: 'medical-drug', parentId: 'medical', name: '买药', icon: 'medical-drug', color: '#F4A4A4', sortOrder: 2, type: 'expense' },
  
  { id: 'study', parentId: 'root', name: '学习', icon: 'study', color: '#A8E6CF', sortOrder: 7, type: 'expense' },
  { id: 'study-book', parentId: 'study', name: '书籍', icon: 'study-book', color: '#A8E6CF', sortOrder: 1, type: 'expense' },
  { id: 'study-course', parentId: 'study', name: '课程', icon: 'study-course', color: '#A8E6CF', sortOrder: 2, type: 'expense' },
  
  { id: 'other-expense', parentId: 'root', name: '其他', icon: 'other', color: '#CBD5E0', sortOrder: 8, type: 'expense' },
  { id: 'other-expense-gift', parentId: 'other-expense', name: '礼物', icon: 'other-gift', color: '#CBD5E0', sortOrder: 1, type: 'expense' },
  { id: 'other-expense-redpacket', parentId: 'other-expense', name: '红包', icon: 'other-redpacket', color: '#CBD5E0', sortOrder: 2, type: 'expense' },
  
  { id: 'salary', parentId: 'root', name: '工资', icon: 'salary', color: '#4CAF50', sortOrder: 1, type: 'income' },
  { id: 'salary-monthly', parentId: 'salary', name: '月薪', icon: 'salary-monthly', color: '#4CAF50', sortOrder: 1, type: 'income' },
  { id: 'salary-bonus', parentId: 'salary', name: '奖金', icon: 'salary-bonus', color: '#4CAF50', sortOrder: 2, type: 'income' },
  
  { id: 'investment', parentId: 'root', name: '理财', icon: 'investment', color: '#66BB6A', sortOrder: 2, type: 'income' },
  { id: 'investment-fund', parentId: 'investment', name: '基金收益', icon: 'investment-fund', color: '#66BB6A', sortOrder: 1, type: 'income' },
  { id: 'investment-stock', parentId: 'investment', name: '股票收益', icon: 'investment-stock', color: '#66BB6A', sortOrder: 2, type: 'income' },
  { id: 'investment-deposit', parentId: 'investment', name: '存款利息', icon: 'investment-deposit', color: '#66BB6A', sortOrder: 3, type: 'income' },
  
  { id: 'part-time', parentId: 'root', name: '兼职', icon: 'part-time', color: '#81C784', sortOrder: 3, type: 'income' },
  { id: 'part-time-freelance', parentId: 'part-time', name: '自由职业', icon: 'part-time-freelance', color: '#81C784', sortOrder: 1, type: 'income' },
  { id: 'part-time-gig', parentId: 'part-time', name: '副业', icon: 'part-time-gig', color: '#81C784', sortOrder: 2, type: 'income' },
  
  { id: 'gift-income', parentId: 'root', name: '礼金', icon: 'gift-income', color: '#A5D6A7', sortOrder: 4, type: 'income' },
  { id: 'gift-income-redpacket', parentId: 'gift-income', name: '红包收入', icon: 'gift-income-redpacket', color: '#A5D6A7', sortOrder: 1, type: 'income' },
  { id: 'gift-income-birthday', parentId: 'gift-income', name: '生日礼物', icon: 'gift-income-birthday', color: '#A5D6A7', sortOrder: 2, type: 'income' },
  
  { id: 'other-income', parentId: 'root', name: '其他', icon: 'other-income', color: '#C8E6C9', sortOrder: 5, type: 'income' },
  { id: 'other-income-refund', parentId: 'other-income', name: '退款', icon: 'other-income-refund', color: '#C8E6C9', sortOrder: 1, type: 'income' },
  { id: 'other-income-unknown', parentId: 'other-income', name: '其他收入', icon: 'other-income-unknown', color: '#C8E6C9', sortOrder: 2, type: 'income' },
];

export const defaultMerchantRules: MerchantRule[] = [
  { id: 'm1', merchantName: '美团外卖', categoryL1: 'food', categoryL2: 'food-lunch', useCount: 0 },
  { id: 'm2', merchantName: '美团优选', categoryL1: 'food', categoryL2: 'food-snack', useCount: 0 },
  { id: 'm3', merchantName: '美团买菜', categoryL1: 'food', categoryL2: 'food-dinner', useCount: 0 },
  { id: 'm4', merchantName: '美团', categoryL1: 'food', categoryL2: 'food-lunch', useCount: 0 },
  { id: 'm5', merchantName: '饿了么', categoryL1: 'food', categoryL2: 'food-dinner', useCount: 0 },
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
  
  { id: 't1', merchantName: '滴滴出行', categoryL1: 'transport', categoryL2: 'transport-taxi', useCount: 0 },
  { id: 't2', merchantName: '滴滴', categoryL1: 'transport', categoryL2: 'transport-taxi', useCount: 0 },
  { id: 't3', merchantName: '高德打车', categoryL1: 'transport', categoryL2: 'transport-taxi', useCount: 0 },
  { id: 't4', merchantName: '首汽约车', categoryL1: 'transport', categoryL2: 'transport-taxi', useCount: 0 },
  { id: 't5', merchantName: '曹操出行', categoryL1: 'transport', categoryL2: 'transport-taxi', useCount: 0 },
  { id: 't6', merchantName: '出租车', categoryL1: 'transport', categoryL2: 'transport-taxi', useCount: 0 },
  { id: 't7', merchantName: '出租', categoryL1: 'transport', categoryL2: 'transport-taxi', useCount: 0 },
  { id: 't8', merchantName: '地铁', categoryL1: 'transport', categoryL2: 'transport-subway', useCount: 0 },
  { id: 't9', merchantName: '公交', categoryL1: 'transport', categoryL2: 'transport-bus', useCount: 0 },
  { id: 't10', merchantName: '高铁', categoryL1: 'transport', categoryL2: 'transport-taxi', useCount: 0 },
  { id: 't11', merchantName: '火车', categoryL1: 'transport', categoryL2: 'transport-taxi', useCount: 0 },
  { id: 't12', merchantName: '机票', categoryL1: 'transport', categoryL2: 'transport-taxi', useCount: 0 },
  { id: 't13', merchantName: '航空', categoryL1: 'transport', categoryL2: 'transport-taxi', useCount: 0 },
  { id: 't14', merchantName: '中石化', categoryL1: 'transport', categoryL2: 'transport-fuel', useCount: 0 },
  { id: 't15', merchantName: '中石油', categoryL1: 'transport', categoryL2: 'transport-fuel', useCount: 0 },
  { id: 't16', merchantName: '加油', categoryL1: 'transport', categoryL2: 'transport-fuel', useCount: 0 },
  
  { id: 's1', merchantName: '淘宝', categoryL1: 'shopping', categoryL2: 'shopping-daily', useCount: 0 },
  { id: 's2', merchantName: '天猫', categoryL1: 'shopping', categoryL2: 'shopping-daily', useCount: 0 },
  { id: 's3', merchantName: '京东', categoryL1: 'shopping', categoryL2: 'shopping-electronics', useCount: 0 },
  { id: 's4', merchantName: '京东到家', categoryL1: 'shopping', categoryL2: 'shopping-daily', useCount: 0 },
  { id: 's5', merchantName: '拼多多', categoryL1: 'shopping', categoryL2: 'shopping-daily', useCount: 0 },
  { id: 's6', merchantName: '唯品会', categoryL1: 'shopping', categoryL2: 'shopping-clothes', useCount: 0 },
  { id: 's7', merchantName: '小红书', categoryL1: 'shopping', categoryL2: 'shopping-beauty', useCount: 0 },
  { id: 's8', merchantName: '抖音电商', categoryL1: 'shopping', categoryL2: 'shopping-daily', useCount: 0 },
  { id: 's9', merchantName: '快手小店', categoryL1: 'shopping', categoryL2: 'shopping-daily', useCount: 0 },
  { id: 's10', merchantName: '苏宁', categoryL1: 'shopping', categoryL2: 'shopping-electronics', useCount: 0 },
  { id: 's11', merchantName: '国美', categoryL1: 'shopping', categoryL2: 'shopping-electronics', useCount: 0 },
  { id: 's12', merchantName: '超市', categoryL1: 'shopping', categoryL2: 'shopping-daily', useCount: 0 },
  { id: 's13', merchantName: '便利店', categoryL1: 'shopping', categoryL2: 'shopping-daily', useCount: 0 },
  { id: 's14', merchantName: '屈臣氏', categoryL1: 'shopping', categoryL2: 'shopping-beauty', useCount: 0 },
  { id: 's15', merchantName: '丝芙兰', categoryL1: 'shopping', categoryL2: 'shopping-beauty', useCount: 0 },
  { id: 's16', merchantName: '优衣库', categoryL1: 'shopping', categoryL2: 'shopping-clothes', useCount: 0 },
  { id: 's17', merchantName: 'ZARA', categoryL1: 'shopping', categoryL2: 'shopping-clothes', useCount: 0 },
  { id: 's18', merchantName: 'H&M', categoryL1: 'shopping', categoryL2: 'shopping-clothes', useCount: 0 },
  { id: 's19', merchantName: '无印良品', categoryL1: 'shopping', categoryL2: 'shopping-daily', useCount: 0 },
  { id: 's20', merchantName: '名创优品', categoryL1: 'shopping', categoryL2: 'shopping-daily', useCount: 0 },
  
  { id: 'e1', merchantName: '电影', categoryL1: 'entertainment', categoryL2: 'entertainment-movie', useCount: 0 },
  { id: 'e2', merchantName: '影城', categoryL1: 'entertainment', categoryL2: 'entertainment-movie', useCount: 0 },
  { id: 'e3', merchantName: '影院', categoryL1: 'entertainment', categoryL2: 'entertainment-movie', useCount: 0 },
  { id: 'e4', merchantName: '游戏', categoryL1: 'entertainment', categoryL2: 'entertainment-game', useCount: 0 },
  { id: 'e5', merchantName: '腾讯游戏', categoryL1: 'entertainment', categoryL2: 'entertainment-game', useCount: 0 },
  { id: 'e6', merchantName: '网易游戏', categoryL1: 'entertainment', categoryL2: 'entertainment-game', useCount: 0 },
  { id: 'e7', merchantName: '王者荣耀', categoryL1: 'entertainment', categoryL2: 'entertainment-game', useCount: 0 },
  { id: 'e8', merchantName: '和平精英', categoryL1: 'entertainment', categoryL2: 'entertainment-game', useCount: 0 },
  { id: 'e9', merchantName: '旅游', categoryL1: 'entertainment', categoryL2: 'entertainment-travel', useCount: 0 },
  { id: 'e10', merchantName: '携程', categoryL1: 'entertainment', categoryL2: 'entertainment-travel', useCount: 0 },
  { id: 'e11', merchantName: '飞猪', categoryL1: 'entertainment', categoryL2: 'entertainment-travel', useCount: 0 },
  { id: 'e12', merchantName: '去哪儿', categoryL1: 'entertainment', categoryL2: 'entertainment-travel', useCount: 0 },
  { id: 'e13', merchantName: '同程', categoryL1: 'entertainment', categoryL2: 'entertainment-travel', useCount: 0 },
  { id: 'e14', merchantName: '酒店', categoryL1: 'entertainment', categoryL2: 'entertainment-travel', useCount: 0 },
  { id: 'e15', merchantName: '民宿', categoryL1: 'entertainment', categoryL2: 'entertainment-travel', useCount: 0 },
  { id: 'e16', merchantName: '运动', categoryL1: 'entertainment', categoryL2: 'entertainment-sport', useCount: 0 },
  { id: 'e17', merchantName: '健身房', categoryL1: 'entertainment', categoryL2: 'entertainment-sport', useCount: 0 },
  { id: 'e18', merchantName: '美团运动', categoryL1: 'entertainment', categoryL2: 'entertainment-sport', useCount: 0 },
  { id: 'e19', merchantName: 'KTV', categoryL1: 'entertainment', categoryL2: 'entertainment-movie', useCount: 0 },
  { id: 'e20', merchantName: '酒吧', categoryL1: 'entertainment', categoryL2: 'entertainment-movie', useCount: 0 },
  
  { id: 'l1', merchantName: '房租', categoryL1: 'living', categoryL2: 'living-rent', useCount: 0 },
  { id: 'l2', merchantName: '租金', categoryL1: 'living', categoryL2: 'living-rent', useCount: 0 },
  { id: 'l3', merchantName: '水费', categoryL1: 'living', categoryL2: 'living-water', useCount: 0 },
  { id: 'l4', merchantName: '电费', categoryL1: 'living', categoryL2: 'living-water', useCount: 0 },
  { id: 'l5', merchantName: '燃气', categoryL1: 'living', categoryL2: 'living-water', useCount: 0 },
  { id: 'l6', merchantName: '宽带', categoryL1: 'living', categoryL2: 'living-internet', useCount: 0 },
  { id: 'l7', merchantName: '网费', categoryL1: 'living', categoryL2: 'living-internet', useCount: 0 },
  { id: 'l8', merchantName: '物业', categoryL1: 'living', categoryL2: 'living-rent', useCount: 0 },
  { id: 'l9', merchantName: '取暖', categoryL1: 'living', categoryL2: 'living-water', useCount: 0 },
  
  { id: 'med1', merchantName: '医院', categoryL1: 'medical', categoryL2: 'medical-hospital', useCount: 0 },
  { id: 'med2', merchantName: '门诊', categoryL1: 'medical', categoryL2: 'medical-hospital', useCount: 0 },
  { id: 'med3', merchantName: '挂号', categoryL1: 'medical', categoryL2: 'medical-hospital', useCount: 0 },
  { id: 'med4', merchantName: '药店', categoryL1: 'medical', categoryL2: 'medical-drug', useCount: 0 },
  { id: 'med5', merchantName: '药房', categoryL1: 'medical', categoryL2: 'medical-drug', useCount: 0 },
  { id: 'med6', merchantName: '美团买药', categoryL1: 'medical', categoryL2: 'medical-drug', useCount: 0 },
  { id: 'med7', merchantName: '阿里健康', categoryL1: 'medical', categoryL2: 'medical-drug', useCount: 0 },
  { id: 'med8', merchantName: '体检', categoryL1: 'medical', categoryL2: 'medical-hospital', useCount: 0 },
  
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
  
  { id: 'g1', merchantName: '红包', categoryL1: 'gift-income', categoryL2: 'gift-income-redpacket', useCount: 0 },
  { id: 'g2', merchantName: '礼金', categoryL1: 'gift-income', categoryL2: 'gift-income-redpacket', useCount: 0 },
  { id: 'g3', merchantName: '生日', categoryL1: 'gift-income', categoryL2: 'gift-income-birthday', useCount: 0 },
  
  { id: 'r1', merchantName: '退款', categoryL1: 'other-income', categoryL2: 'other-income-refund', useCount: 0 },
  { id: 'r2', merchantName: '退回', categoryL1: 'other-income', categoryL2: 'other-income-refund', useCount: 0 },
];

export const billCategoryMapping: Record<string, { categoryL1: string; categoryL2: string }> = {
  '餐饮美食': { categoryL1: 'food', categoryL2: 'food-dinner' },
  '食品饮料': { categoryL1: 'food', categoryL2: 'food-snack' },
  '交通出行': { categoryL1: 'transport', categoryL2: 'transport-taxi' },
  '购物消费': { categoryL1: 'shopping', categoryL2: 'shopping-daily' },
  '日用百货': { categoryL1: 'shopping', categoryL2: 'shopping-daily' },
  '居家生活': { categoryL1: 'living', categoryL2: 'living-rent' },
  '休闲娱乐': { categoryL1: 'entertainment', categoryL2: 'entertainment-movie' },
  '医疗健康': { categoryL1: 'medical', categoryL2: 'medical-hospital' },
  '教育学习': { categoryL1: 'study', categoryL2: 'study-course' },
  '生活服务': { categoryL1: 'other-expense', categoryL2: 'other-expense-gift' },
  '转账红包': { categoryL1: 'other-expense', categoryL2: 'other-expense-redpacket' },
  '充值缴费': { categoryL1: 'living', categoryL2: 'living-water' },
  '金融理财': { categoryL1: 'investment', categoryL2: 'investment-fund' },
  '工资': { categoryL1: 'salary', categoryL2: 'salary-monthly' },
  '奖金': { categoryL1: 'salary', categoryL2: 'salary-bonus' },
  '其他': { categoryL1: 'other-expense', categoryL2: 'other-expense-gift' },
};

export const defaultTransactions: Transaction[] = [
  { id: '1', date: '2026-07-08', amount: 35.5, type: 'expense', categoryL1: 'food', categoryL2: 'food-lunch', merchant: '美团外卖', note: '黄焖鸡米饭', source: 'manual', createdAt: '2026-07-08T12:30:00Z' },
  { id: '2', date: '2026-07-08', amount: 15, type: 'expense', categoryL1: 'transport', categoryL2: 'transport-subway', merchant: '地铁', note: '通勤', source: 'manual', createdAt: '2026-07-08T08:00:00Z' },
  { id: '3', date: '2026-07-07', amount: 299, type: 'expense', categoryL1: 'shopping', categoryL2: 'shopping-clothes', merchant: '淘宝', note: '夏季T恤', source: 'manual', createdAt: '2026-07-07T20:15:00Z' },
  { id: '4', date: '2026-07-07', amount: 88, type: 'expense', categoryL1: 'entertainment', categoryL2: 'entertainment-movie', merchant: '万达影城', note: '电影票', source: 'manual', createdAt: '2026-07-07T19:00:00Z' },
  { id: '5', date: '2026-07-06', amount: 2000, type: 'income', categoryL1: 'salary', categoryL2: 'salary-monthly', merchant: '工资', note: '七月工资', source: 'manual', createdAt: '2026-07-06T10:00:00Z' },
  { id: '6', date: '2026-07-06', amount: 1500, type: 'expense', categoryL1: 'living', categoryL2: 'living-rent', merchant: '房东', note: '七月房租', source: 'manual', createdAt: '2026-07-06T09:00:00Z' },
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