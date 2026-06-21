import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertOctagon, CheckCircle2, ChevronRight, Clock, TrendingUp, BarChart3, MessageSquarePlus, Filter, Search, RotateCcw, Radio, ThumbsUp, AlertCircle, BookX, Lightbulb, BookOpen, Target, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { emotionOptions, visitIntents, triagePaths, openingQuestions } from '@/data/mockData'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const pathConfig: Record<string, { color: string; label: string; bg: string }> = {
  skin_management: { color: '#34d399', label: '皮肤管理', bg: 'bg-emerald-100 text-emerald-700' },
  laser: { color: '#8b5cf6', label: '光电治疗', bg: 'bg-violet-100 text-violet-700' },
  injection: { color: '#3b82f6', label: '注射微整', bg: 'bg-blue-100 text-blue-700' },
  surgery: { color: '#f43f5e', label: '外科手术', bg: 'bg-rose-100 text-rose-700' },
  combined: { color: '#f59e0b', label: '联合评估', bg: 'bg-amber-100 text-amber-700' },
}
const deviationOptions = ['无偏差', '遗漏病史', '话术不规范', '分诊路径偏差', '风险未识别', '其他']
const riskLabels: Record<string, { label: string; bg: string }> = {
  green: { label: '低风险', bg: 'bg-emerald-100 text-emerald-700' },
  yellow: { label: '中风险', bg: 'bg-amber-100 text-amber-700' },
  red: { label: '高风险', bg: 'bg-rose-100 text-rose-700' },
}
const statusLabels: Record<string, { label: string; bg: string }> = {
  pending_improvement: { label: '待改进', bg: 'bg-rose-100 text-rose-700' },
  approved: { label: '已通过', bg: 'bg-emerald-100 text-emerald-700' },
  pending: { label: '待评价', bg: 'bg-gray-100 text-gray-600' },
}
const deviationTimelineMap: Record<string, string> = {
  '遗漏病史': '风险核对', '话术不规范': '开场提问', '分诊路径偏差': '分诊建议',
  '风险未识别': '风险核对', '其他': '顾客画像',
}
const deviationSuggestionMap: Record<string, string[]> = {
  '遗漏病史': ['下次接待时逐项核对8项病史，重点确认过敏史、手术史、用药史三项关键项'],
  '话术不规范': ['先学习Q&A知识库，下次接待严格按推荐话术提问'],
  '分诊路径偏差': ['仔细核对分诊建议中的推荐依据，理解路径匹配'],
  '风险未识别': ['先完成风险核对后再分诊'],
  '其他': ['与主管沟通具体改进方向'],
}
const learningCategories = [
  { key: 'A', title: '风险核对训练', icon: AlertOctagon, theme: 'rose', deviationTypes: ['遗漏病史', '风险未识别'], practiceScript: '您好，为了确保您的治疗安全，需要跟您核对几个重要问题：请问您是否有药物过敏史、既往手术史，目前正在服用哪些药物？另外近期是否做过其他医美项目？' },
  { key: 'B', title: '话术规范训练', icon: MessageSquare, theme: 'blue', deviationTypes: ['话术不规范'], practiceScript: '您好！很高兴为您服务，今天主要想帮您解决什么问题呢？可以跟我说说您最在意的部位和期望的效果吗？' },
  { key: 'C', title: '分诊路径训练', icon: Target, theme: 'amber', deviationTypes: ['分诊路径偏差', '其他'], practiceScript: '根据您的需求，我为您推荐{pathLabel}路径的XX医生，TA在这方面有丰富的经验，可以先为您做一个专业的面诊评估。' },
]
const themeMap: Record<string, { card: string; badge: string; icon: string; text: string }> = {
  rose: { card: 'bg-rose-50 border-rose-200', badge: 'bg-rose-500', icon: 'text-rose-500', text: 'text-rose-700' },
  blue: { card: 'bg-blue-50 border-blue-200', badge: 'bg-blue-500', icon: 'text-blue-500', text: 'text-blue-700' },
  amber: { card: 'bg-amber-50 border-amber-200', badge: 'bg-amber-500', icon: 'text-amber-500', text: 'text-amber-700' },
}
const formatDate = (iso: string) => { const d = new Date(iso); return `${d.getMonth() + 1}月${d.getDate()}日` }
const getIntentLabel = (id: string) => visitIntents.find(v => v.id === id)?.label || id
const getEmotionLabel = (id: string) => emotionOptions.find(e => e.id === id)?.label || id
const getStatusBadge = (s?: string) => (!s ? statusLabels['pending'] : statusLabels[s] || statusLabels['pending'])
const isWithinDays = (iso: string, days: number) => {
  const d = new Date(iso).getTime()
  const now = Date.now()
  return now - d <= days * 86400000
}

export default function Review() {
  const { completedRecords, reviews, updateReview, addReview } = useStore()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [reviewFilter, setReviewFilter] = useState<'全部' | '待改进' | '已通过' | '待评价'>('全部')
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ deviationType: '', supervisorComment: '', status: 'approved' as 'approved' | 'pending_improvement' })
  const [filterName, setFilterName] = useState('')
  const [filterIntent, setFilterIntent] = useState('')
  const [filterRisk, setFilterRisk] = useState('')
  const [filterPath, setFilterPath] = useState('')
  const [filterSupervisor, setFilterSupervisor] = useState('')
  const [filterDeviation, setFilterDeviation] = useState('')
  const [filterTimeRange, setFilterTimeRange] = useState<'今日' | '近7天' | '近30天' | '全部时间'>('全部时间')
  const [modalRecordId, setModalRecordId] = useState<string | null>(null)
  const [expandedLearningKey, setExpandedLearningKey] = useState<string | null>(null)
  const reviewMap = useMemo(() => new Map(reviews.map(r => [r.consultationId, r])), [reviews])
  const statusCounts = useMemo(() => {
    const counts = { 全部: completedRecords.length, 待改进: 0, 已通过: 0, 待评价: 0 }
    completedRecords.forEach(r => {
      const review = reviewMap.get(r.consultation.id)
      if (!review || !review.status) counts['待评价']++
      else if (review.status === 'pending_improvement') counts['待改进']++
      else if (review.status === 'approved') counts['已通过']++
    })
    return counts
  }, [completedRecords, reviewMap])
  const filteredRecords = useMemo(() => completedRecords.filter(r => {
    if (filterName && !r.consultation.customerName.includes(filterName)) return false
    if (filterIntent && r.consultation.visitIntent !== filterIntent) return false
    if (filterRisk && r.riskCheck.riskLevel !== filterRisk) return false
    if (filterPath && r.triageResult.recommendedPath !== filterPath) return false
    const review = reviewMap.get(r.consultation.id)
    if (filterSupervisor && !(review?.supervisorComment?.includes(filterSupervisor))) return false
    if (filterDeviation) {
      if (filterDeviation === '全部偏差') {
        if (!review?.deviationType || review.deviationType === '无偏差') return false
      } else if (review?.deviationType !== filterDeviation) return false
    }
    const dateStr = r.consultation.completedAt || r.consultation.createdAt
    if (filterTimeRange === '今日') {
      const d = new Date(dateStr)
      const today = new Date()
      if (d.toDateString() !== today.toDateString()) return false
    } else if (filterTimeRange === '近7天') {
      if (!isWithinDays(dateStr, 7)) return false
    } else if (filterTimeRange === '近30天') {
      if (!isWithinDays(dateStr, 30)) return false
    }
    return true
  }), [completedRecords, filterName, filterIntent, filterRisk, filterPath, filterSupervisor, filterDeviation, filterTimeRange, reviewMap])
  const pendingImprovementRecords = useMemo(() =>
    filteredRecords.filter(r => reviewMap.get(r.consultation.id)?.status === 'pending_improvement')
  , [filteredRecords, reviewMap])
  const normalRecords = useMemo(() => {
    if (reviewFilter === '待改进') return []
    return filteredRecords.filter(r => {
      const s = reviewMap.get(r.consultation.id)?.status
      if (reviewFilter === '已通过') return s === 'approved'
      if (reviewFilter === '待评价') return !s || s === 'pending'
      return true
    })
  }, [filteredRecords, reviewMap, reviewFilter])
  const learningTaskData = useMemo(() => {
    return learningCategories.map(cat => {
      const records = pendingImprovementRecords.filter(r => {
        const review = reviewMap.get(r.consultation.id)
        return review?.deviationType && cat.deviationTypes.includes(review.deviationType)
      })
      const comments = records
        .map(r => reviewMap.get(r.consultation.id)?.supervisorComment)
        .filter(Boolean) as string[]
      return { ...cat, records, comments }
    })
  }, [pendingImprovementRecords, reviewMap])
  const pathDistribution = useMemo(() => {
    const dist = filteredRecords.reduce<Record<string, number>>((acc, r) => {
      acc[r.triageResult.recommendedPath] = (acc[r.triageResult.recommendedPath] || 0) + 1
      return acc
    }, {})
    return Object.entries(dist).map(([name, value]) => ({ name, value }))
  }, [filteredRecords])
  const barData = useMemo(() => {
    const today = new Date()
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today)
      d.setDate(d.getDate() - (6 - i))
      const label = `${d.getMonth() + 1}/${d.getDate()}`
      const dayStr = d.toDateString()
      const count = filteredRecords.filter(r => new Date(r.consultation.completedAt || r.consultation.createdAt).toDateString() === dayStr).length
      return { day: label, count }
    })
  }, [filteredRecords])
  const pendingImprovementCount = pendingImprovementRecords.length
  const approvedCount = reviews.filter(r => r.status === 'approved').length
  const deviationRate = reviews.length > 0 ? Math.round((reviews.filter(r => r.status === 'pending_improvement').length / reviews.length) * 100) : 0
  const stats = [
    { label: '总接待', value: filteredRecords.length, icon: BarChart3, color: 'text-amber-500' },
    { label: '已通过', value: approvedCount, icon: CheckCircle2, color: 'text-emerald-500' },
    { label: '待改进', value: `${deviationRate}%`, icon: TrendingUp, color: 'text-rose-500' },
  ]
  const resetFilters = () => {
    setFilterName('')
    setFilterIntent('')
    setFilterRisk('')
    setFilterPath('')
    setFilterSupervisor('')
    setFilterDeviation('')
    setFilterTimeRange('全部时间')
  }
  const startEdit = (id: string, c: { deviationType?: string; supervisorComment?: string; status?: string }) => {
    setEditingReviewId(id)
    setEditForm({ deviationType: c.deviationType || '', supervisorComment: c.supervisorComment || '', status: c.status === 'pending_improvement' ? 'pending_improvement' : 'approved' })
  }
  const saveEdit = (id: string) => {
    updateReview(id, { ...editForm, reviewedAt: new Date().toISOString() })
    setEditingReviewId(null)
  }
  const handleAddReview = (consultationId: string) => {
    const id = `review-${Date.now()}`
    addReview({ id, consultationId, deviationType: '', supervisorComment: '', status: 'pending' })
    setEditingReviewId(id)
    setEditForm({ deviationType: '', supervisorComment: '', status: 'approved' })
  }
  const handleMarkApproved = (consultationId: string) => {
    const review = reviewMap.get(consultationId)
    if (review) updateReview(review.id, { status: 'approved', reviewedAt: new Date().toISOString() })
  }
  const modalRecord = useMemo(() => {
    if (!modalRecordId) return null
    const record = completedRecords.find(r => r.consultation.id === modalRecordId)
    const review = reviewMap.get(modalRecordId)
    return record && review ? { record, review } : null
  }, [modalRecordId, completedRecords, reviewMap])
  const timelineSteps = (record: typeof completedRecords[0], review?: typeof reviews[0]) => {
    const intent = record.consultation.visitIntent
    const questions = openingQuestions[intent] || []
    const presentContra = record.riskCheck.contraindicationChecks.filter(c => c.present).map(c => c.item)
    return [
      { icon: '🎤', title: '开场提问', content: `按${getIntentLabel(intent)}来意标准化提问${questions.length}个开场问题`, active: true },
      { icon: '👤', title: '顾客画像', tags: record.profile.standardTags, raw: record.profile.rawDescription, emotion: getEmotionLabel(record.profile.emotion), concern: record.profile.concern, active: true },
      { icon: '⚠️', title: '风险核对', riskLevel: record.riskCheck.riskLevel, contraindications: presentContra, active: true },
      { icon: '🎯', title: '分诊建议', path: record.triageResult.recommendedPath, reason: record.triageResult.reason, conclusion: record.triageResult.summary, active: true },
      { icon: '💬', title: '主管评语', review, active: !!review },
    ]
  }
  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
      <AnimatePresence>
        {modalRecord && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setModalRecordId(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={e => e.stopPropagation()} className="bg-white rounded-2xl w-full max-w-md max-h-[85vh] overflow-y-auto">
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900">改进方案</h3>
                  <button onClick={() => setModalRecordId(null)} className="text-gray-400 hover:text-gray-600"><BookX className="w-5 h-5" /></button>
                </div>
                <div className="bg-amber-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2"><MessageSquarePlus className="w-4 h-4 text-amber-600" /><p className="text-sm font-semibold text-amber-900">主管评语</p></div>
                  <p className="text-sm text-amber-800">{modalRecord.review.supervisorComment || '暂无评语'}</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2"><Clock className="w-4 h-4 text-blue-600" /><p className="text-sm font-semibold text-blue-900">对应时间线节点</p></div>
                  <p className="text-sm text-blue-800"><span className="inline-block px-2 py-0.5 bg-blue-100 rounded-full">{deviationTimelineMap[modalRecord.review.deviationType || ''] || '顾客画像'}</span></p>
                </div>
                <div className="bg-emerald-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3"><Lightbulb className="w-4 h-4 text-emerald-600" /><p className="text-sm font-semibold text-emerald-900">下次接待建议</p></div>
                  <ul className="space-y-2">
                    {(deviationSuggestionMap[modalRecord.review.deviationType || ''] || deviationSuggestionMap['其他']).map((s, i) => (
                      <li key={i} className="flex gap-2 text-sm text-emerald-800"><span className="w-5 h-5 rounded-full bg-emerald-200 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{i + 1}</span><span>{s}</span></li>
                    ))}
                  </ul>
                </div>
                <button onClick={() => { handleMarkApproved(modalRecord.record.consultation.id); setModalRecordId(null) }} className="w-full py-2.5 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />标为已通过
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-gray-900">学习复盘</h1>
        <p className="text-sm text-gray-500 mt-1">个人接待统计</p>
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-3 gap-3">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-xl shadow-sm p-3 text-center">
            <s.icon className={`w-5 h-5 mx-auto mb-1 ${s.color}`} />
            <p className="text-xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500">{s.label}</p>
          </div>
        ))}
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex items-center gap-2 mb-3"><Filter className="w-4 h-4 text-gray-500" /><h2 className="text-base font-semibold text-gray-900">筛选条件</h2></div>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="搜索顾客姓名" value={filterName} onChange={e => setFilterName(e.target.value)} className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="搜索主管姓名/评语关键词" value={filterSupervisor} onChange={e => setFilterSupervisor(e.target.value)} className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <select value={filterIntent} onChange={e => setFilterIntent(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-2 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400">
              <option value="">全部来意</option>
              {visitIntents.map(v => <option key={v.id} value={v.id}>{v.label}</option>)}
            </select>
            <select value={filterRisk} onChange={e => setFilterRisk(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-2 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400">
              <option value="">全部风险</option><option value="green">低风险</option><option value="yellow">中风险</option><option value="red">高风险</option>
            </select>
            <select value={filterPath} onChange={e => setFilterPath(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-2 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400">
              <option value="">全部路径</option>
              {triagePaths.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
            </select>
          </div>
          <select value={filterDeviation} onChange={e => setFilterDeviation(e.target.value)} className="w-full text-sm border border-gray-200 rounded-lg px-2 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400">
            <option value="">全部偏差类型</option>
            <option value="全部偏差">全部偏差</option>
            {deviationOptions.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
          <div className="flex gap-2 flex-wrap">
            {(['今日', '近7天', '近30天', '全部时间'] as const).map(t => (
              <button key={t} onClick={() => setFilterTimeRange(t)} className={`px-3 py-1.5 text-xs rounded-full transition-colors ${filterTimeRange === t ? 'bg-amber-500 text-white font-medium' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{t}</button>
            ))}
          </div>
          <button onClick={resetFilters} className="flex items-center gap-1 text-xs text-gray-500 hover:text-amber-600"><RotateCcw className="w-3 h-3" />重置筛选</button>
        </div>
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-xl shadow-sm p-4">
        <h2 className="text-base font-semibold text-gray-900 mb-3">分诊路径分布</h2>
        {pathDistribution.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pathDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={40} paddingAngle={3} label={({ name }) => pathConfig[name]?.label || name}>
                {pathDistribution.map(entry => <Cell key={entry.name} fill={pathConfig[entry.name]?.color || '#94a3b8'} />)}
              </Pie>
              <Tooltip formatter={(v: number, n: string) => [v, pathConfig[n]?.label || n]} />
            </PieChart>
          </ResponsiveContainer>
        ) : <p className="text-sm text-gray-400 text-center py-8">暂无数据</p>}
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-xl shadow-sm p-4">
        <h2 className="text-base font-semibold text-gray-900 mb-3">近7日接待量</h2>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={barData}><XAxis dataKey="day" tick={{ fontSize: 11 }} /><YAxis allowDecimals={false} tick={{ fontSize: 11 }} /><Tooltip /><Bar dataKey="count" fill="#facc15" radius={[4, 4, 0, 0]} /></BarChart>
        </ResponsiveContainer>
      </motion.div>
      {pendingImprovementRecords.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.33 }}>
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-5 h-5 text-indigo-500" />
            <h2 className="text-base font-semibold text-gray-900">📚 新人学习任务</h2>
          </div>
          <div className="space-y-2">
            {learningTaskData.filter(cat => cat.records.length > 0).map(cat => {
              const theme = themeMap[cat.theme]
              const Icon = cat.icon
              const isExpanded = expandedLearningKey === cat.key
              return (
                <div key={cat.key} className={`rounded-xl shadow-sm border ${theme.card} overflow-hidden`}>
                  <button onClick={() => setExpandedLearningKey(isExpanded ? null : cat.key)} className="w-full px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-5 h-5 ${theme.icon}`} />
                      <span className={`text-sm font-semibold ${theme.text}`}>{cat.title}</span>
                      <span className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 ${theme.badge} text-white text-xs font-bold rounded-full`}>{cat.records.length}</span>
                    </div>
                    {isExpanded ? <ChevronUp className={`w-4 h-4 ${theme.icon}`} /> : <ChevronDown className={`w-4 h-4 ${theme.icon}`} />}
                  </button>
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-white/50">
                        <div className="px-4 py-3 space-y-3 bg-white/60">
                          <div>
                            <p className={`text-xs font-semibold ${theme.text} mb-1.5`}>案例列表</p>
                            <div className="space-y-1">
                              {cat.records.map(r => (
                                <div key={r.consultation.id} className="flex items-center gap-2 text-xs text-gray-700 bg-white rounded-lg px-2 py-1.5">
                                  <span className="font-medium text-gray-900">{r.consultation.customerName}</span>
                                  <span className="text-gray-400">·</span>
                                  <span>{formatDate(r.consultation.completedAt || r.consultation.createdAt)}</span>
                                  <span className="text-gray-400">·</span>
                                  <span className="px-1.5 py-0.5 bg-amber-50 text-amber-700 rounded-full">{getIntentLabel(r.consultation.visitIntent)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className={`text-xs font-semibold ${theme.text} mb-1.5`}>主管评语汇总</p>
                            <div className="space-y-1">
                              {cat.comments.map((c, i) => (
                                <p key={i} className="text-xs text-gray-700 bg-white rounded-lg px-2 py-1.5">• {c}</p>
                              ))}
                            </div>
                          </div>
                          <div className={`rounded-lg p-3 ${theme.card}`}>
                            <div className="flex items-center gap-1 mb-1.5">
                              <Lightbulb className={`w-3.5 h-3.5 ${theme.icon}`} />
                              <p className={`text-xs font-semibold ${theme.text}`}>🎯 可练习话术</p>
                            </div>
                            <p className="text-xs text-gray-800 leading-relaxed">
                              {cat.key === 'C' && cat.records.length > 0
                                ? cat.practiceScript.replace('{pathLabel}', pathConfig[cat.records[0].triageResult.recommendedPath]?.label || '对应')
                                : cat.practiceScript}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        </motion.div>
      )}
      {reviewFilter !== '已通过' && reviewFilter !== '待评价' && pendingImprovementRecords.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <AlertOctagon className="w-5 h-5 text-rose-500" />
              <h2 className="text-base font-semibold text-gray-900">接待改进清单</h2>
              <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-rose-500 text-white text-xs font-bold rounded-full">{pendingImprovementCount}</span>
            </div>
          </div>
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {pendingImprovementRecords.map(record => {
                const path = record.triageResult.recommendedPath
                const cfg = pathConfig[path] || { label: path, bg: 'bg-gray-100 text-gray-600', color: '#94a3b8' }
                const review = reviewMap.get(record.consultation.id)!
                return (
                  <motion.div key={record.consultation.id} layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0 }} transition={{ duration: 0.3 }} className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-l-rose-500 overflow-hidden">
                    <div className="flex items-start justify-between mb-2">
                      <div className="text-left">
                        <p className="text-sm font-medium text-gray-900">{record.consultation.customerName}</p>
                        <p className="text-xs text-gray-500">{formatDate(record.consultation.completedAt || record.consultation.createdAt)} · {getIntentLabel(record.consultation.visitIntent)}</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${cfg.bg}`}>{cfg.label}</span>
                    </div>
                    {review.deviationType && <span className="inline-block text-xs bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full mb-2 font-medium">{review.deviationType}</span>}
                    <p className="text-sm text-gray-700 mb-3 line-clamp-2">{review.supervisorComment || '暂无评语'}</p>
                    <div className="flex gap-2">
                      <button onClick={() => setModalRecordId(record.consultation.id)} className="flex-1 py-2 bg-amber-50 text-amber-700 text-xs font-medium rounded-lg hover:bg-amber-100 flex items-center justify-center gap-1"><Lightbulb className="w-3.5 h-3.5" />点击查看改进方案</button>
                      <button onClick={() => handleMarkApproved(record.consultation.id)} className="flex-1 py-2 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-lg hover:bg-emerald-100 flex items-center justify-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" />标为已通过</button>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
      {reviewFilter !== '待改进' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <h2 className="text-base font-semibold text-gray-900 mb-3">接待记录</h2>
          <div className="space-y-2">
            <AnimatePresence>
              {normalRecords.map(record => {
                const path = record.triageResult.recommendedPath
                const cfg = pathConfig[path] || { label: path, bg: 'bg-gray-100 text-gray-600', color: '#94a3b8' }
                const review = reviewMap.get(record.consultation.id)
                const isExpanded = expandedId === record.consultation.id
                const steps = timelineSteps(record, review)
                const isPendingImprovement = review?.status === 'pending_improvement'
                return (
                  <div key={record.consultation.id} className={`bg-white rounded-xl shadow-sm overflow-hidden ${isPendingImprovement ? 'ring-2 ring-rose-200' : ''}`}>
                    <button onClick={() => setExpandedId(isExpanded ? null : record.consultation.id)} className="w-full px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3 text-left">
                        <CheckCircle2 className={`w-4 h-4 shrink-0 ${isPendingImprovement ? 'text-rose-500' : 'text-emerald-500'}`} />
                        <div><p className="text-sm font-medium text-gray-900">{record.consultation.customerName}</p><p className="text-xs text-gray-500">{formatDate(record.consultation.completedAt || record.consultation.createdAt)} · {getIntentLabel(record.consultation.visitIntent)}</p></div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${cfg.bg}`}>{cfg.label}</span>
                        {review && <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusBadge(review.status).bg}`}>{getStatusBadge(review.status).label}</span>}
                        <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                      </div>
                    </button>
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-gray-100">
                          <div className="px-4 py-3 space-y-4">
                            {steps.map((step, idx) => (
                              <div key={idx} className="flex gap-3">
                                <div className="flex flex-col items-center">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${step.active ? 'bg-amber-100' : 'bg-gray-100'}`}>{step.icon}</div>
                                  {idx < steps.length - 1 && <div className={`w-0.5 flex-1 ${step.active && steps[idx + 1]?.active ? 'bg-amber-300' : 'bg-gray-200'}`} />}
                                </div>
                                <div className="flex-1 pb-4">
                                  <p className={`text-sm font-medium ${step.active ? 'text-gray-900' : 'text-gray-400'}`}>{step.title}</p>
                                  {step.title === '开场提问' && <p className="text-xs text-gray-600 mt-1">{step.content}</p>}
                                  {step.title === '顾客画像' && (
                                    <div className="text-xs text-gray-600 mt-1 space-y-1">
                                      {step.tags?.length > 0 && <div className="flex flex-wrap gap-1">{step.tags.map((t, i) => <span key={i} className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full">{t}</span>)}</div>}
                                      {step.raw && <p><span className="text-gray-400">顾客原话：</span>{step.raw}</p>}
                                      <p><span className="text-gray-400">情绪：</span>{step.emotion || '未记录'}{step.concern && ` · 顾虑：${step.concern}`}</p>
                                    </div>
                                  )}
                                  {step.title === '风险核对' && (
                                    <div className="text-xs text-gray-600 mt-1">
                                      <div className="flex items-center gap-2">
                                        <span className={`px-1.5 py-0.5 rounded ${riskLabels[step.riskLevel!]?.bg || ''}`}>{riskLabels[step.riskLevel!]?.label || step.riskLevel}</span>
                                        {step.contraindications?.length > 0 && <span className="text-rose-600 flex items-center gap-1"><AlertOctagon className="w-3 h-3" />{step.contraindications.join('、')}</span>}
                                      </div>
                                    </div>
                                  )}
                                  {step.title === '分诊建议' && (
                                    <div className="text-xs text-gray-600 mt-1 space-y-1">
                                      <p><span className="text-gray-400">推荐路径：</span><span className={`px-1.5 py-0.5 rounded ${pathConfig[step.path!]?.bg || ''}`}>{pathConfig[step.path!]?.label || step.path}</span></p>
                                      {step.reason && <p><span className="text-gray-400">理由：</span>{step.reason}</p>}
                                      {step.conclusion && <p><span className="text-gray-400">结论：</span>{step.conclusion}</p>}
                                    </div>
                                  )}
                                  {step.title === '主管评语' && (
                                    <div className="text-xs text-gray-600 mt-1">
                                      {step.review ? (
                                        <div className="space-y-1">
                                          <div className="flex items-center gap-2">
                                            <span className={`px-1.5 py-0.5 rounded ${getStatusBadge(step.review.status).bg}`}>{getStatusBadge(step.review.status).label}</span>
                                            {step.review.deviationType && step.review.deviationType !== '无偏差' && <span className="text-rose-600">{step.review.deviationType}</span>}
                                          </div>
                                          <p>{step.review.supervisorComment || '暂无评语'}</p>
                                          {step.review.reviewedAt && <p className="text-gray-400 flex items-center gap-1"><Clock className="w-3 h-3" />{formatDate(step.review.reviewedAt)}</p>}
                                        </div>
                                      ) : <p className="text-gray-400">待主管评价</p>}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </AnimatePresence>
            {normalRecords.length === 0 && <p className="text-sm text-gray-400 text-center py-4">暂无接待记录</p>}
          </div>
        </motion.div>
      )}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-gray-900">主管反馈</h2>
          <div className="flex items-center gap-1 text-xs">
            <Filter className="w-3 h-3 text-gray-400" />
            {(['全部', '待改进', '已通过', '待评价'] as const).map(f => (
              <button key={f} onClick={() => setReviewFilter(f)} className={`px-2 py-1 rounded-md transition-colors ${reviewFilter === f ? 'bg-amber-500 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>{f}({statusCounts[f]})</button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          {(reviewFilter === '全部' || reviewFilter === '待改进' ? pendingImprovementRecords.concat(normalRecords) : normalRecords).map(record => {
            const review = reviewMap.get(record.consultation.id)
            const statusBadge = getStatusBadge(review?.status)
            const isEditing = editingReviewId === (review?.id || '')
            const hasDeviation = review?.deviationType && review.deviationType.trim() !== '' && review.deviationType !== '无偏差'
            return (
              <div key={record.consultation.id} className={`bg-white rounded-xl shadow-sm p-4 border-l-4 ${review?.status === 'pending_improvement' ? 'border-l-rose-500' : review?.status === 'approved' ? 'border-l-emerald-400' : 'border-l-gray-300'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2"><span className="text-sm font-medium text-gray-900">{record.consultation.customerName}</span><span className="text-xs text-gray-400">{formatDate(record.consultation.completedAt || record.consultation.createdAt)}</span></div>
                  <div className="flex items-center gap-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${pathConfig[record.triageResult.recommendedPath]?.bg || 'bg-gray-100 text-gray-600'}`}>{pathConfig[record.triageResult.recommendedPath]?.label || record.triageResult.recommendedPath}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusBadge.bg}`}>{statusBadge.label}</span>
                  </div>
                </div>
                {review && !isEditing && (
                  <>
                    {hasDeviation && <span className="inline-block text-xs bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full mb-2">{review.deviationType}</span>}
                    <p className="text-sm text-gray-700">{review.supervisorComment || '暂无评语'}</p>
                    {review.reviewedAt && <p className="text-xs text-gray-400 mt-2 flex items-center gap-1"><Clock className="w-3 h-3" />{formatDate(review.reviewedAt)}</p>}
                    <button onClick={() => startEdit(review.id, review)} className="mt-2 flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700"><MessageSquarePlus className="w-3 h-3" />编辑评语</button>
                  </>
                )}
                {review && isEditing && (
                  <div className="space-y-2 mt-1">
                    <div className="flex items-center gap-4 text-sm">
                      <label className="flex items-center gap-1 cursor-pointer"><Radio className={`w-4 h-4 ${editForm.status === 'approved' ? 'text-emerald-500 fill-emerald-500' : 'text-gray-400'}`} onClick={() => setEditForm(f => ({ ...f, status: 'approved' }))} /><span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3 text-emerald-500" />已通过</span></label>
                      <label className="flex items-center gap-1 cursor-pointer"><Radio className={`w-4 h-4 ${editForm.status === 'pending_improvement' ? 'text-rose-500 fill-rose-500' : 'text-gray-400'}`} onClick={() => setEditForm(f => ({ ...f, status: 'pending_improvement' }))} /><span className="flex items-center gap-1"><AlertCircle className="w-3 h-3 text-rose-500" />待改进</span></label>
                    </div>
                    <select value={editForm.deviationType} onChange={e => setEditForm(f => ({ ...f, deviationType: e.target.value }))} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400">
                      <option value="">选择偏差类型</option>{deviationOptions.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                    <textarea value={editForm.supervisorComment} onChange={e => setEditForm(f => ({ ...f, supervisorComment: e.target.value }))} placeholder="输入主管评语..." rows={3} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none" />
                    <div className="flex gap-2">
                      <button onClick={() => saveEdit(review.id)} className="px-4 py-1.5 bg-amber-500 text-white text-xs rounded-lg hover:bg-amber-600">保存</button>
                      <button onClick={() => setEditingReviewId(null)} className="px-4 py-1.5 bg-gray-100 text-gray-600 text-xs rounded-lg hover:bg-gray-200">取消</button>
                    </div>
                  </div>
                )}
                {!review && <button onClick={() => handleAddReview(record.consultation.id)} className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700"><MessageSquarePlus className="w-3 h-3" />添加评价</button>}
              </div>
            )
          })}
          {(reviewFilter === '待改进' ? pendingImprovementRecords.length === 0 : normalRecords.length === 0) && <p className="text-sm text-gray-400 text-center py-4">暂无反馈记录</p>}
        </div>
      </motion.div>
    </div>
  )
}
