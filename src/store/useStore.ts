import { create } from 'zustand'

export interface Consultation {
  id: string
  customerName: string
  visitIntent: string
  status: 'in_progress' | 'completed'
  createdAt: string
  completedAt?: string
}

export interface Profile {
  id: string
  consultationId: string
  rawDescription: string
  standardTags: string[]
  emotion: 'anxious' | 'expectant' | 'hesitant' | 'resistant' | 'calm' | ''
  concern: string
  followUpDirections: string[]
}

export interface HistoryCheckItem {
  item: string
  checked: boolean
}

export interface ContraindicationCheck {
  item: string
  present: boolean
}

export interface RiskCheck {
  id: string
  consultationId: string
  historyChecks: HistoryCheckItem[]
  contraindicationChecks: ContraindicationCheck[]
  riskLevel: 'green' | 'yellow' | 'red'
  doctorInterventionNeeded: boolean
  interventionReason?: string
}

export interface TriageResult {
  id: string
  consultationId: string
  recommendedPath: 'skin_management' | 'laser' | 'injection' | 'surgery' | 'combined'
  reason: string
  summary: string
}

export interface CompletedRecord {
  consultation: Consultation
  profile: Profile
  riskCheck: RiskCheck
  triageResult: TriageResult
}

export interface Review {
  id: string
  consultationId: string
  supervisorComment?: string
  deviationType?: string
  status?: 'pending_improvement' | 'approved' | 'pending'
  reviewedAt?: string
}

export interface QAItem {
  id: string
  category: string
  q: string
  a: string
}

export interface SmartRecommendation {
  recommendedPath: string
  reason: string
  conclusion: string
  confidence: 'high' | 'medium' | 'low'
}

const contraindicationMap: Record<string, string[]> = {
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

const injectionFearTags = ['怕僵', '自然效果优先', '过度填充顾虑', '渐进式改善需求']
const wrinkleTags = ['面部松弛改善', '皱纹减少', '抗衰年轻化']

interface AppState {
  currentConsultation: Consultation | null
  currentProfile: Profile | null
  currentRiskCheck: RiskCheck | null
  currentTriageResult: TriageResult | null
  consultations: Consultation[]
  completedRecords: CompletedRecord[]
  reviews: Review[]
  qaItems: QAItem[]

  startConsultation: (intent: string, contraindications: ContraindicationCheck[]) => void
  setVisitIntent: (intent: string) => void
  setVisitIntentWithCascade: (intent: string) => void
  updateProfile: (profile: Partial<Profile>) => void
  updateRiskCheck: (risk: Partial<RiskCheck>) => void
  toggleHistoryCheck: (index: number) => void
  toggleContraindication: (index: number) => void
  updateTriageResult: (triage: Partial<TriageResult>) => void
  completeConsultation: () => void
  resetCurrentSession: () => void
  addReview: (review: Review) => void
  updateReview: (id: string, data: Partial<Review>) => void
  addQA: (item: QAItem) => void
  editQA: (id: string, data: Partial<QAItem>) => void
  deleteQA: (id: string) => void
  getSmartRecommendation: () => SmartRecommendation | null
}

const generateId = () => Math.random().toString(36).substring(2, 10)
const now = () => new Date().toISOString()

const defaultQA: QAItem[] = [
  { id: 'qa-1', category: '抗衰', q: '热玛吉和超声刀的区别是什么？', a: '热玛吉主要通过射频加热真皮层刺激胶原再生，超声刀通过聚焦超声作用于SMAS筋膜层。热玛吉更适合浅层细纹，超声刀更适合深层松弛提升。' },
  { id: 'qa-2', category: '抗衰', q: '线雕能维持多久？', a: '一般可维持1-2年，具体因线材类型和个人代谢差异而异。建议配合其他抗衰项目效果更佳。' },
  { id: 'qa-3', category: '注射', q: '玻尿酸和肉毒素可以同一天做吗？', a: '可以，两者作用机制不同。玻尿酸填充容积，肉毒放松肌肉。联合使用时注意注射层次和手法。' },
  { id: 'qa-4', category: '注射', q: '肉毒素多久见效？', a: '一般3-7天开始见效，2周达到最佳效果。效果维持约4-6个月。' },
  { id: 'qa-5', category: '光电', q: '激光祛斑要做几次？', a: '一般3-5次为一个疗程，每次间隔4-6周。具体次数取决于斑点类型和深度。' },
  { id: 'qa-6', category: '皮肤管理', q: '水光针多久做一次？', a: '初期建议每月1次，连续3次后可延长至2-3个月维护一次。' },
  { id: 'qa-7', category: '外科', q: '双眼皮手术恢复期多久？', a: '一般7天拆线，2-4周基本消肿，3-6个月完全自然。术后需遵医嘱冷敷和忌口。' },
  { id: 'qa-8', category: '皮肤管理', q: '果酸换肤后注意什么？', a: '术后3天避免化妆，严格防晒SPF50+，避免使用含酸类护肤品，加强保湿修复。' },
]

const defaultReviews: Review[] = [
  {
    id: 'review-1',
    consultationId: 'demo-1',
    supervisorComment: '补问环节遗漏了过敏史，需加强病史追问意识',
    deviationType: '遗漏病史',
    status: 'pending_improvement',
    reviewedAt: new Date(Date.now() - 72000000).toISOString(),
  },
  {
    id: 'review-2',
    consultationId: 'demo-2',
    supervisorComment: '分诊路径正确，话术运用规范',
    deviationType: '',
    status: 'approved',
    reviewedAt: new Date(Date.now() - 36000000).toISOString(),
  },
]

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (raw) return JSON.parse(raw)
  } catch {}
  return fallback
}

function saveToStorage(key: string, data: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch {}
}

function getSmartRecommendationLogic(
  intent: string,
  rawDescription: string,
  tags: string[],
  riskLevel: string
): SmartRecommendation | null {
  if (!intent) return null
  const riskBad = riskLevel === 'red'
  if (riskBad) {
    return {
      recommendedPath: 'combined',
      reason: '顾客存在高风险因素，安全为第一原则，需联合评估确认治疗的安全性，建议由医生提前介入评估。',
      conclusion: '安全优先：存在禁忌症或高风险因素，需医生提前介入评估，推荐联合评估路径确认治疗可行性。',
      confidence: 'high',
    }
  }
  const hasFearTag = tags.some((t) => injectionFearTags.includes(t))
  const hasFearText = rawDescription.includes('怕僵') || rawDescription.includes('不自然') || rawDescription.includes('假')
  const isAntiAging = intent === 'anti_aging'
  const hasWrinkleTag = tags.some((t) => wrinkleTags.includes(t))
  if (isAntiAging && (hasFearTag || hasFearText)) {
    return {
      recommendedPath: 'injection',
      reason: '基于顾客对自然效果的关注和怕僵顾虑，优先推荐注射微整路径，由注射医生把控用量确保自然，避免过度填充导致面部僵硬。',
      conclusion: '建议导向注射医生面诊，重点沟通自然风格与注射剂量，必要时联合抗衰光电项目。',
      confidence: 'high',
    }
  }
  if (isAntiAging && hasWrinkleTag && !hasFearTag) {
    return {
      recommendedPath: 'combined',
      reason: '顾客有明确的抗衰需求且关注面部松弛和皱纹，建议抗衰联合评估，由医生综合制定注射+光电的联合方案。',
      conclusion: '建议进行抗衰联合评估，从筋膜层、真皮层、表皮层多维度设计方案，兼顾提升与肤质改善。',
      confidence: 'high',
    }
  }
  if (intent === 'whitening') {
    return {
      recommendedPath: 'laser',
      reason: '光电方案对色素改善最为直接有效，可配合皮肤管理巩固效果。',
      conclusion: '建议光电治疗路径，优先选择皮秒/超皮秒等激光设备改善色素问题。',
      confidence: 'high',
    }
  }
  if (intent === 'contouring') {
    return {
      recommendedPath: 'injection',
      reason: '注射类项目对轮廓微调效果显著且恢复期短，适合初诊顾客。',
      conclusion: '建议注射微整路径，可通过玻尿酸填充或肉毒素瘦脸实现轮廓优化。',
      confidence: 'high',
    }
  }
  if (intent === 'skin_repair') {
    return {
      recommendedPath: 'skin_management',
      reason: '皮肤管理是屏障修复和肤质改善的首选路径，温和且可逐步加强。',
      conclusion: '建议先通过皮肤管理建立健康皮肤屏障，再根据恢复情况考虑进阶项目。',
      confidence: 'high',
    }
  }
  if (intent === 'acne') {
    return {
      recommendedPath: 'skin_management',
      reason: '痘肌管理首选皮肤管理路径，规范清洁与控油是基础。',
      conclusion: '建议皮肤管理路径，先控制炎症再改善痘印痘坑。',
      confidence: 'high',
    }
  }
  if (intent === 'body_sculpt') {
    return {
      recommendedPath: 'laser',
      reason: '光电类对局部脂肪消融有良好效果，非侵入式顾客接受度高。',
      conclusion: '建议光电体雕路径，可选择冷冻溶脂或热玛吉体部治疗。',
      confidence: 'medium',
    }
  }
  if (intent === 'eye_rejuvenation') {
    return {
      recommendedPath: 'injection',
      reason: '注射类可改善鱼尾纹及眼周细纹，效果立竿见影。',
      conclusion: '建议注射微整路径，可联合眼周光电项目综合改善。',
      confidence: 'medium',
    }
  }
  if (intent === 'lip_enhancement') {
    return {
      recommendedPath: 'injection',
      reason: '玻尿酸注射是唇部塑形的首选方案，可灵活调整形态。',
      conclusion: '建议注射微整路径，根据顾客唇形基础和审美偏好设计方案。',
      confidence: 'high',
    }
  }
  if (intent === 'scar_repair') {
    return {
      recommendedPath: 'combined',
      reason: '疤痕修复通常需要联合光电+注射+皮肤管理的综合方案。',
      conclusion: '建议联合评估，根据疤痕类型和阶段制定多维度修复方案。',
      confidence: 'high',
    }
  }
  if (intent === 'hair_restoration') {
    return {
      recommendedPath: 'combined',
      reason: '毛发管理需要联合头皮养护+中胚层疗法+激光的综合方案。',
      conclusion: '建议联合评估，先改善毛囊环境再考虑是否需要植发。',
      confidence: 'high',
    }
  }
  return null
}

export const useStore = create<AppState>((set, get) => ({
  currentConsultation: null,
  currentProfile: null,
  currentRiskCheck: null,
  currentTriageResult: null,
  consultations: loadFromStorage<Consultation[]>('consultations', []),
  completedRecords: loadFromStorage<CompletedRecord[]>('completedRecords', []),
  reviews: loadFromStorage<Review[]>('reviews', defaultReviews),
  qaItems: loadFromStorage<QAItem[]>('qaItems', defaultQA),

  startConsultation: (intent: string, contraindications: ContraindicationCheck[]) => {
    const id = generateId()
    const consultation: Consultation = {
      id,
      customerName: `顾客${get().completedRecords.length + 1}`,
      visitIntent: intent,
      status: 'in_progress',
      createdAt: now(),
    }
    const profile: Profile = {
      id: generateId(),
      consultationId: id,
      rawDescription: '',
      standardTags: [],
      emotion: '',
      concern: '',
      followUpDirections: [],
    }
    const riskCheck: RiskCheck = {
      id: generateId(),
      consultationId: id,
      historyChecks: [
        { item: '过敏史', checked: false },
        { item: '既往手术史', checked: false },
        { item: '当前用药', checked: false },
        { item: '近期注射史', checked: false },
        { item: '光敏史', checked: false },
        { item: '自体免疫疾病', checked: false },
        { item: '妊娠/哺乳期', checked: false },
        { item: '心脑血管疾病', checked: false },
      ],
      contraindicationChecks: contraindications,
      riskLevel: 'green',
      doctorInterventionNeeded: false,
    }
    const triageResult: TriageResult = {
      id: generateId(),
      consultationId: id,
      recommendedPath: 'skin_management',
      reason: '',
      summary: '',
    }
    set({
      currentConsultation: consultation,
      currentProfile: profile,
      currentRiskCheck: riskCheck,
      currentTriageResult: triageResult,
    })
  },

  setVisitIntent: (intent: string) => {
    set((state) => ({
      currentConsultation: state.currentConsultation
        ? { ...state.currentConsultation, visitIntent: intent }
        : null,
    }))
  },

  setVisitIntentWithCascade: (intent: string) => {
    set((state) => {
      if (!state.currentConsultation || !state.currentRiskCheck) return {}
      const newContraChecks = (contraindicationMap[intent] || []).map((item) => ({ item, present: false }))
      const riskState = recalcRisk(state.currentRiskCheck.historyChecks, newContraChecks)
      const smartRec = getSmartRecommendationLogic(
        intent,
        state.currentProfile?.rawDescription || '',
        state.currentProfile?.standardTags || [],
        riskState.riskLevel
      )
      const newTriage = smartRec
        ? { recommendedPath: smartRec.recommendedPath as TriageResult['recommendedPath'], reason: smartRec.reason }
        : { recommendedPath: 'skin_management' as const, reason: '' }
      return {
        currentConsultation: { ...state.currentConsultation, visitIntent: intent },
        currentRiskCheck: {
          ...state.currentRiskCheck,
          contraindicationChecks: newContraChecks,
          ...riskState,
        },
        currentTriageResult: state.currentTriageResult
          ? { ...state.currentTriageResult, ...newTriage }
          : null,
      }
    })
  },

  updateProfile: (profile: Partial<Profile>) => {
    set((state) => ({
      currentProfile: state.currentProfile
        ? { ...state.currentProfile, ...profile }
        : null,
    }))
  },

  updateRiskCheck: (risk: Partial<RiskCheck>) => {
    set((state) => ({
      currentRiskCheck: state.currentRiskCheck
        ? { ...state.currentRiskCheck, ...risk }
        : null,
    }))
  },

  toggleHistoryCheck: (index: number) => {
    set((state) => {
      if (!state.currentRiskCheck) return {}
      const checks = [...state.currentRiskCheck.historyChecks]
      checks[index] = { ...checks[index], checked: !checks[index].checked }
      const riskState = recalcRisk(checks, state.currentRiskCheck.contraindicationChecks)
      return {
        currentRiskCheck: {
          ...state.currentRiskCheck,
          historyChecks: checks,
          ...riskState,
        },
      }
    })
  },

  toggleContraindication: (index: number) => {
    set((state) => {
      if (!state.currentRiskCheck) return {}
      const checks = [...state.currentRiskCheck.contraindicationChecks]
      checks[index] = { ...checks[index], present: !checks[index].present }
      const riskState = recalcRisk(state.currentRiskCheck.historyChecks, checks)
      return {
        currentRiskCheck: {
          ...state.currentRiskCheck,
          contraindicationChecks: checks,
          ...riskState,
        },
      }
    })
  },

  updateTriageResult: (triage: Partial<TriageResult>) => {
    set((state) => ({
      currentTriageResult: state.currentTriageResult
        ? { ...state.currentTriageResult, ...triage }
        : null,
    }))
  },

  completeConsultation: () => {
    const { currentConsultation, currentProfile, currentRiskCheck, currentTriageResult, consultations, completedRecords } = get()
    if (!currentConsultation) return
    const completed: Consultation = {
      ...currentConsultation,
      status: 'completed',
      completedAt: now(),
    }
    const record: CompletedRecord = {
      consultation: completed,
      profile: currentProfile!,
      riskCheck: currentRiskCheck!,
      triageResult: currentTriageResult!,
    }
    const newConsultations = [completed, ...consultations]
    const newRecords = [record, ...completedRecords]
    saveToStorage('consultations', newConsultations)
    saveToStorage('completedRecords', newRecords)
    set({
      consultations: newConsultations,
      completedRecords: newRecords,
      currentConsultation: null,
      currentProfile: null,
      currentRiskCheck: null,
      currentTriageResult: null,
    })
  },

  resetCurrentSession: () => {
    set({
      currentConsultation: null,
      currentProfile: null,
      currentRiskCheck: null,
      currentTriageResult: null,
    })
  },

  addReview: (review: Review) => {
    set((state) => {
      const newReviews = [review, ...state.reviews]
      saveToStorage('reviews', newReviews)
      return { reviews: newReviews }
    })
  },

  updateReview: (id: string, data: Partial<Review>) => {
    set((state) => {
      const newReviews = state.reviews.map(r =>
        r.id === id ? { ...r, ...data } : r
      )
      saveToStorage('reviews', newReviews)
      return { reviews: newReviews }
    })
  },

  addQA: (item: QAItem) => {
    set((state) => {
      const newItems = [...state.qaItems, item]
      saveToStorage('qaItems', newItems)
      return { qaItems: newItems }
    })
  },

  editQA: (id: string, data: Partial<QAItem>) => {
    set((state) => {
      const newItems = state.qaItems.map(q =>
        q.id === id ? { ...q, ...data } : q
      )
      saveToStorage('qaItems', newItems)
      return { qaItems: newItems }
    })
  },

  deleteQA: (id: string) => {
    set((state) => {
      const newItems = state.qaItems.filter(q => q.id !== id)
      saveToStorage('qaItems', newItems)
      return { qaItems: newItems }
    })
  },

  getSmartRecommendation: () => {
    const { currentConsultation, currentProfile, currentRiskCheck } = get()
    if (!currentConsultation) return null
    return getSmartRecommendationLogic(
      currentConsultation.visitIntent,
      currentProfile?.rawDescription || '',
      currentProfile?.standardTags || [],
      currentRiskCheck?.riskLevel || 'green'
    )
  },
}))

function recalcRisk(historyChecks: HistoryCheckItem[], contraindicationChecks: ContraindicationCheck[]) {
  const anyContraindicationPresent = contraindicationChecks.some(c => c.present)
  const uncheckedCritical = historyChecks.filter(
    (c, i) => !c.checked && (i <= 2 || i === 6 || i === 7)
  )
  const allCriticalChecked = uncheckedCritical.length === 0
  let riskLevel: 'green' | 'yellow' | 'red' = 'green'
  let doctorInterventionNeeded = false
  let interventionReason: string | undefined
  if (anyContraindicationPresent) {
    riskLevel = 'red'
    doctorInterventionNeeded = true
    const presentItems = contraindicationChecks.filter(c => c.present).map(c => c.item)
    interventionReason = `存在禁忌症：${presentItems.join('、')}`
  } else if (!allCriticalChecked) {
    riskLevel = 'yellow'
  }
  return { riskLevel, doctorInterventionNeeded, interventionReason }
}
