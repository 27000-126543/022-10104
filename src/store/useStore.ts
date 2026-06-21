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
  reviewedAt?: string
}

export interface QAItem {
  id: string
  category: string
  q: string
  a: string
}

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
    reviewedAt: new Date(Date.now() - 72000000).toISOString(),
  },
  {
    id: 'review-2',
    consultationId: 'demo-2',
    supervisorComment: '分诊路径正确，话术运用规范',
    deviationType: '',
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
      customerName: `顾客${get().consultations.length + 1}`,
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
