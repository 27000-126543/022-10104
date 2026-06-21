export const visitIntents = [
  { id: 'anti_aging', label: '抗衰年轻化', icon: '✨' },
  { id: 'whitening', label: '美白提亮', icon: '💎' },
  { id: 'contouring', label: '轮廓塑形', icon: '🎪' },
  { id: 'skin_repair', label: '肌肤修复', icon: '🩹' },
  { id: 'acne', label: '痘肌管理', icon: '🧴' },
  { id: 'body_sculpt', label: '体雕塑身', icon: '🏃' },
  { id: 'eye_rejuvenation', label: '眼部年轻化', icon: '👁️' },
  { id: 'lip_enhancement', label: '唇部美化', icon: '💋' },
  { id: 'scar_repair', label: '疤痕修复', icon: '🩺' },
  { id: 'hair_restoration', label: '毛发管理', icon: '💇' },
]

export const openingQuestions: Record<string, { question: string; followUps: string[] }[]> = {
  anti_aging: [
    {
      question: '您最希望改善哪个部位的衰老表现？',
      followUps: ['是面部松弛还是皱纹更困扰您？', '有没有具体照镜子时最在意的区域？'],
    },
    {
      question: '您之前做过哪些抗衰类项目？',
      followUps: ['效果如何？维持了多久？', '有没有不满意的地方？'],
    },
    {
      question: '您对恢复期有什么要求？',
      followUps: ['能接受多长的恢复时间？', '工作性质是否允许短暂肿胀或泛红？'],
    },
    {
      question: '您对抗衰效果的期待是怎样的？',
      followUps: ['希望自然渐进还是明显改变？', '对"看得出做了但看不出痕迹"的理解是什么？'],
    },
  ],
  whitening: [
    {
      question: '您觉得肤色不均匀还是整体偏暗？',
      followUps: ['是全脸还是局部（如颧骨、嘴周）？', '色斑还是单纯暗沉？'],
    },
    {
      question: '您日常防晒习惯如何？',
      followUps: ['出门涂防晒吗？多久补涂？', '有没有光敏史？'],
    },
    {
      question: '之前做过美白类项目吗？',
      followUps: ['做过哪些？效果如何？', '有没有出现反黑或过敏？'],
    },
  ],
  contouring: [
    {
      question: '您最希望调整哪个部位的轮廓？',
      followUps: ['是下巴、颧骨还是咬肌？', '希望线条更柔和还是更立体？'],
    },
    {
      question: '您对注射类和手术类项目了解多少？',
      followUps: ['能接受注射类改善吗？', '对手术类有没有顾虑？'],
    },
    {
      question: '您预算大概在什么范围？',
      followUps: ['是单次预算还是年度预算？', '能接受分期吗？'],
    },
  ],
  skin_repair: [
    {
      question: '您皮肤的主要困扰是什么？',
      followUps: ['是敏感、红血丝还是屏障受损？', '什么时候开始出现的？'],
    },
    {
      question: '您目前在用什么护肤品？',
      followUps: ['有没有使用酸类或A醇？', '是否在医生指导下使用的？'],
    },
    {
      question: '之前是否做过激光或刷酸类项目？',
      followUps: ['做完后反应如何？', '有没有出现色素沉着？'],
    },
  ],
  acne: [
    {
      question: '您的痘痘是反复发作还是偶发？',
      followUps: ['主要长在哪个部位？', '是红肿型还是粉刺为主？'],
    },
    {
      question: '您有用手挤痘的习惯吗？',
      followUps: ['有没有留下痘坑痘印？', '目前有没有在服用异维A酸？'],
    },
  ],
  body_sculpt: [
    {
      question: '您希望改善哪个部位的线条？',
      followUps: ['是腹部、大腿还是手臂？', '是脂肪型还是松弛型？'],
    },
    {
      question: '您的运动和饮食习惯如何？',
      followUps: ['每周运动几次？', '体重近期有波动吗？'],
    },
  ],
  eye_rejuvenation: [
    {
      question: '您眼部的主要困扰是什么？',
      followUps: ['是眼袋、黑眼圈还是鱼尾纹？', '上眼皮有松弛吗？'],
    },
    {
      question: '您对眼部项目了解多少？',
      followUps: ['知道眼袋手术和注射改善的区别吗？', '能接受恢复期多长？'],
    },
  ],
  lip_enhancement: [
    {
      question: '您希望改善唇部的哪些方面？',
      followUps: ['是唇形、唇色还是丰唇？', '有没有做过唇部项目？'],
    },
  ],
  scar_repair: [
    {
      question: '疤痕是什么类型？',
      followUps: ['是增生性还是凹陷性？', '疤痕形成多久了？'],
    },
    {
      question: '之前做过疤痕治疗吗？',
      followUps: ['用的什么方法？效果如何？', '有没有过敏反应？'],
    },
  ],
  hair_restoration: [
    {
      question: '您的脱发类型是什么？',
      followUps: ['是发际线后移还是整体稀疏？', '家族有脱发史吗？'],
    },
  ],
}

export const promiseWarnings = [
  '不可承诺"保证瘦脸""永久效果"',
  '不可承诺"做完立刻年轻10岁"',
  '不可承诺"完全无痛无恢复期"',
  '不可承诺"效果永久不变"',
  '不可暗示"和某明星一样的效果"',
  '不可承诺"零风险零副作用"',
]

export const qaLibrary = [
  { category: '抗衰', q: '热玛吉和超声刀的区别是什么？', a: '热玛吉主要通过射频加热真皮层刺激胶原再生，超声刀通过聚焦超声作用于SMAS筋膜层。热玛吉更适合浅层细纹，超声刀更适合深层松弛提升。' },
  { category: '抗衰', q: '线雕能维持多久？', a: '一般可维持1-2年，具体因线材类型和个人代谢差异而异。建议配合其他抗衰项目效果更佳。' },
  { category: '注射', q: '玻尿酸和肉毒素可以同一天做吗？', a: '可以，两者作用机制不同。玻尿酸填充容积，肉毒放松肌肉。联合使用时注意注射层次和手法。' },
  { category: '注射', q: '肉毒素多久见效？', a: '一般3-7天开始见效，2周达到最佳效果。效果维持约4-6个月。' },
  { category: '光电', q: '激光祛斑要做几次？', a: '一般3-5次为一个疗程，每次间隔4-6周。具体次数取决于斑点类型和深度。' },
  { category: '皮肤管理', q: '水光针多久做一次？', a: '初期建议每月1次，连续3次后可延长至2-3个月维护一次。' },
  { category: '外科', q: '双眼皮手术恢复期多久？', a: '一般7天拆线，2-4周基本消肿，3-6个月完全自然。术后需遵医嘱冷敷和忌口。' },
  { category: '皮肤管理', q: '果酸换肤后注意什么？', a: '术后3天避免化妆，严格防晒SPF50+，避免使用含酸类护肤品，加强保湿修复。' },
]

export const contraindicationMap: Record<string, string[]> = {
  anti_aging: ['活动性皮肤感染', '近期使用异维A酸（6个月内）', '自体免疫疾病活动期'],
  whitening: ['光敏性皮炎', '近期暴晒史', '使用光敏性药物'],
  contouring: ['局部感染灶', '凝血功能障碍', '对填充物成分过敏'],
  skin_repair: ['活动性疱疹', '正在使用强效酸类产品', '皮肤屏障严重受损合并感染'],
  acne: ['正在服用异维A酸', '活动性皮肤感染', '对治疗成分过敏'],
  body_sculpt: ['局部脂肪过少', '皮下组织病变', '严重心脑血管疾病'],
  eye_rejuvenation: ['青光眼', '活动性眼部感染', '干眼症重度'],
  lip_enhancement: ['唇疱疹活动期', '对填充物过敏', '口腔感染'],
  scar_repair: ['瘢痕体质', '活动性感染', '近期使用类固醇'],
  hair_restoration: ['活动性头皮感染', '凝血障碍', '严重全身性疾病'],
}

export const tagMapping: Record<string, string[]> = {
  '想显年轻': ['抗衰年轻化', '面部松弛改善', '皱纹减少'],
  '怕僵': ['自然效果优先', '过度填充顾虑', '渐进式改善需求'],
  '脸大': ['轮廓塑形', '咬肌肥大/脂肪堆积鉴别', '下颌线优化'],
  '皮肤差': ['肌肤修复', '屏障修复', '肤色改善'],
  '有斑': ['色素管理', '美白提亮', '防晒需求'],
  '想瘦': ['体雕塑身', '脂肪管理', '局部塑形'],
  '眼袋': ['眼部年轻化', '眼袋改善', '眶隔脂肪管理'],
  '痘印': ['痘肌管理', '色素沉着', '肤质改善'],
  '嘴唇薄': ['唇部美化', '唇形优化', '丰唇需求'],
  '疤痕': ['疤痕修复', '创伤修复', '皮肤重建'],
}

export const triagePaths = [
  {
    id: 'skin_management',
    label: '皮肤管理',
    icon: '🧖',
    description: '适用于肤质改善、补水保湿、屏障修复等需求',
    color: 'from-emerald-400 to-teal-500',
  },
  {
    id: 'laser',
    label: '光电治疗',
    icon: '⚡',
    description: '适用于色素、血管、胶原再生等光电项目',
    color: 'from-violet-400 to-purple-500',
  },
  {
    id: 'injection',
    label: '注射微整',
    icon: '💉',
    description: '适用于填充、瘦脸、除皱等注射类项目',
    color: 'from-blue-400 to-indigo-500',
  },
  {
    id: 'surgery',
    label: '外科手术',
    icon: '🔬',
    description: '适用于需要手术干预的眼袋、隆鼻、轮廓等',
    color: 'from-rose-400 to-pink-500',
  },
  {
    id: 'combined',
    label: '联合评估',
    icon: '🔄',
    description: '适用于多维度需求，需医生联合制定综合方案',
    color: 'from-amber-400 to-orange-500',
  },
]

export const emotionOptions = [
  { id: 'anxious', label: '焦虑', icon: '😰' },
  { id: 'expectant', label: '期待', icon: '😊' },
  { id: 'hesitant', label: '犹豫', icon: '🤔' },
  { id: 'resistant', label: '抗拒', icon: '😤' },
  { id: 'calm', label: '平静', icon: '😌' },
]

export const mockConsultationHistory = [
  {
    id: 'demo-1',
    customerName: '顾客A',
    visitIntent: '抗衰',
    path: 'injection',
    date: new Date(Date.now() - 86400000).toISOString(),
    hasDeviation: true,
  },
  {
    id: 'demo-2',
    customerName: '顾客B',
    visitIntent: '美白',
    path: 'laser',
    date: new Date(Date.now() - 43200000).toISOString(),
    hasDeviation: false,
  },
  {
    id: 'demo-3',
    customerName: '顾客C',
    visitIntent: '轮廓塑形',
    path: 'injection',
    date: new Date(Date.now() - 21600000).toISOString(),
    hasDeviation: true,
  },
]
