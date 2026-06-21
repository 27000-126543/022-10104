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

export interface RiskCheck {
  id: string
  consultationId: string
  historyChecks: HistoryCheckItem[]
  contraindications: string[]
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

export interface Review {
  id: string
  consultationId: string
  supervisorComment?: string
  deviationType?: string
  reviewedAt?: string
}

interface AppState {
  currentConsultation: Consultation | null
  currentProfile: Profile | null
  currentRiskCheck: RiskCheck | null
  currentTriageResult: TriageResult | null
  consultations: Consultation[]
  reviews: Review[]

  startConsultation: (intent: string) => void
  setVisitIntent: (intent: string) => void
  updateProfile: (profile: Partial<Profile>) => void
  updateRiskCheck: (risk: Partial<RiskCheck>) => void
  toggleHistoryCheck: (index: number) => void
  updateTriageResult: (triage: Partial<TriageResult>) => void
  completeConsultation: () => void
  resetCurrentSession: () => void
  addReview: (review: Review) => void
}

const generateId = () => Math.random().toString(36).substring(2, 10)
const now = () => new Date().toISOString()

export const useStore = create<AppState>((set, get) => ({
  currentConsultation: null,
  currentProfile: null,
  currentRiskCheck: null,
  currentTriageResult: null,
  consultations: [
    {
      id: 'demo-1',
      customerName: '顾客A',
      visitIntent: '抗衰',
      status: 'completed',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      completedAt: new Date(Date.now() - 82800000).toISOString(),
    },
    {
      id: 'demo-2',
      customerName: '顾客B',
      visitIntent: '美白',
      status: 'completed',
      createdAt: new Date(Date.now() - 43200000).toISOString(),
      completedAt: new Date(Date.now() - 39600000).toISOString(),
    },
  ],
  reviews: [
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
  ],

  startConsultation: (intent: string) => {
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
      contraindications: [],
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
      const uncheckedCritical = checks.filter(
        (c, i) => !c.checked && (i <= 2 || i === 6 || i === 7)
      )
      const allCriticalChecked = uncheckedCritical.length === 0
      const anyContraindication = state.currentRiskCheck.contraindications.length > 0
      let riskLevel: 'green' | 'yellow' | 'red' = 'green'
      let doctorInterventionNeeded = false
      if (anyContraindication) {
        riskLevel = 'red'
        doctorInterventionNeeded = true
      } else if (!allCriticalChecked) {
        riskLevel = 'yellow'
      }
      return {
        currentRiskCheck: {
          ...state.currentRiskCheck,
          historyChecks: checks,
          riskLevel,
          doctorInterventionNeeded,
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
    const { currentConsultation, consultations } = get()
    if (!currentConsultation) return
    const completed: Consultation = {
      ...currentConsultation,
      status: 'completed',
      completedAt: now(),
    }
    set({
      consultations: [completed, ...consultations],
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
    set((state) => ({
      reviews: [review, ...state.reviews],
    }))
  },
}))
