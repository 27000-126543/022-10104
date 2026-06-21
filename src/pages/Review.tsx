import { useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, AlertCircle, CheckCircle2, Clock, ChevronRight, BarChart3, MessageSquarePlus, Filter } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { emotionOptions, visitIntents, triagePaths } from '@/data/mockData'
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

function formatDate(iso: string) {
  const d = new Date(iso)
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

function formatShortDate(iso: string) {
  const d = new Date(iso)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

function getIntentLabel(intentId: string) {
  return visitIntents.find(v => v.id === intentId)?.label || intentId
}

function getEmotionLabel(emotionId: string) {
  return emotionOptions.find(e => e.id === emotionId)?.label || emotionId
}

export default function Review() {
  const { completedRecords, reviews, updateReview, addReview } = useStore()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [reviewFilter, setReviewFilter] = useState<'全部' | '有偏差' | '无偏差'>('全部')
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ deviationType: '', supervisorComment: '' })

  const deviationCount = reviews.filter(r => r.deviationType && r.deviationType.trim() !== '' && r.deviationType !== '无偏差').length
  const deviationRate = reviews.length > 0 ? Math.round((deviationCount / reviews.length) * 100) : 0

  const pathDistribution = completedRecords.reduce<Record<string, number>>((acc, r) => {
    const path = r.triageResult.recommendedPath
    acc[path] = (acc[path] || 0) + 1
    return acc
  }, {})
  const pieData = Object.entries(pathDistribution).map(([name, value]) => ({ name, value }))

  const today = new Date()
  const barData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() - (6 - i))
    const label = `${d.getMonth() + 1}/${d.getDate()}`
    const dayStr = d.toDateString()
    const count = completedRecords.filter(r => new Date(r.consultation.completedAt || r.consultation.createdAt).toDateString() === dayStr).length
    return { day: label, count }
  })

  const stats = [
    { label: '总接待', value: completedRecords.length, icon: BarChart3, color: 'text-amber-500' },
    { label: '已完成', value: completedRecords.length, icon: CheckCircle2, color: 'text-emerald-500' },
    { label: '偏差率', value: `${deviationRate}%`, icon: TrendingUp, color: 'text-rose-500' },
  ]

  const reviewMap = new Map(reviews.map(r => [r.consultationId, r]))

  const filteredRecords = completedRecords.filter(record => {
    const review = reviewMap.get(record.consultation.id)
    if (reviewFilter === '有偏差') return review && review.deviationType && review.deviationType.trim() !== '' && review.deviationType !== '无偏差'
    if (reviewFilter === '无偏差') return !review || !review.deviationType || review.deviationType.trim() === '' || review.deviationType === '无偏差'
    return true
  })

  function startEdit(reviewId: string, current: { deviationType?: string; supervisorComment?: string }) {
    setEditingReviewId(reviewId)
    setEditForm({ deviationType: current.deviationType || '', supervisorComment: current.supervisorComment || '' })
  }

  function saveEdit(reviewId: string) {
    updateReview(reviewId, { deviationType: editForm.deviationType, supervisorComment: editForm.supervisorComment, reviewedAt: new Date().toISOString() })
    setEditingReviewId(null)
  }

  function handleAddReview(consultationId: string) {
    const id = `review-${Date.now()}`
    addReview({ id, consultationId, deviationType: '', supervisorComment: '' })
    setEditingReviewId(id)
    setEditForm({ deviationType: '', supervisorComment: '' })
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
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

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-xl shadow-sm p-4">
        <h2 className="text-base font-semibold text-gray-900 mb-3">分诊路径分布</h2>
        {pieData.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={40} paddingAngle={3} label={({ name }) => pathConfig[name]?.label || name}>
                {pieData.map(entry => (<Cell key={entry.name} fill={pathConfig[entry.name]?.color || '#94a3b8'} />))}
              </Pie>
              <Tooltip formatter={(v: number, n: string) => [v, pathConfig[n]?.label || n]} />
            </PieChart>
          </ResponsiveContainer>
        ) : <p className="text-sm text-gray-400 text-center py-8">暂无数据</p>}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-xl shadow-sm p-4">
        <h2 className="text-base font-semibold text-gray-900 mb-3">近7日接待量</h2>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={barData}>
            <XAxis dataKey="day" tick={{ fontSize: 11 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="count" fill="#facc15" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <h2 className="text-base font-semibold text-gray-900 mb-3">接待记录</h2>
        <div className="space-y-2">
          {completedRecords.map(record => {
            const path = record.triageResult.recommendedPath
            const cfg = pathConfig[path] || { label: path, bg: 'bg-gray-100 text-gray-600', color: '#94a3b8' }
            return (
              <div key={record.consultation.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <button onClick={() => setExpandedId(expandedId === record.consultation.id ? null : record.consultation.id)} className="w-full px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-left">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{record.consultation.customerName}</p>
                      <p className="text-xs text-gray-500">{formatDate(record.consultation.completedAt || record.consultation.createdAt)} · {getIntentLabel(record.consultation.visitIntent)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${cfg.bg}`}>{cfg.label}</span>
                    <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${expandedId === record.consultation.id ? 'rotate-90' : ''}`} />
                  </div>
                </button>
                {expandedId === record.consultation.id && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="px-4 pb-3 text-xs text-gray-600 border-t border-gray-100 pt-2 space-y-1.5">
                    <p><span className="text-gray-400">顾客诉求：</span>{record.profile.standardTags.join('、') || '无'}</p>
                    <p><span className="text-gray-400">顾客原话：</span>{record.profile.rawDescription || '无'}</p>
                    <p><span className="text-gray-400">情绪顾虑：</span>{getEmotionLabel(record.profile.emotion)}{record.profile.concern ? ` · ${record.profile.concern}` : ''}</p>
                    <p className="flex items-center gap-1"><span className="text-gray-400">风险核对：</span><span className={`px-1.5 py-0.5 rounded text-xs ${riskLabels[record.riskCheck.riskLevel]?.bg || ''}`}>{riskLabels[record.riskCheck.riskLevel]?.label || record.riskCheck.riskLevel}</span>{record.riskCheck.contraindicationChecks.filter(c => c.present).map(c => c.item).join('、') || ''}</p>
                    <p><span className="text-gray-400">推荐路径：</span>{cfg.label}{record.triageResult.reason ? ` · ${record.triageResult.reason}` : ''}</p>
                    <p><span className="text-gray-400">面诊摘要：</span>{record.triageResult.summary || '无'}</p>
                  </motion.div>
                )}
              </div>
            )
          })}
          {completedRecords.length === 0 && <p className="text-sm text-gray-400 text-center py-4">暂无接待记录</p>}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-gray-900">主管反馈</h2>
          <div className="flex items-center gap-1 text-xs">
            <Filter className="w-3 h-3 text-gray-400" />
            {(['全部', '有偏差', '无偏差'] as const).map(f => (
              <button key={f} onClick={() => setReviewFilter(f)} className={`px-2 py-1 rounded-md transition-colors ${reviewFilter === f ? 'bg-amber-500 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>{f}</button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          {filteredRecords.map(record => {
            const review = reviewMap.get(record.consultation.id)
            const hasDeviation = review && review.deviationType && review.deviationType.trim() !== '' && review.deviationType !== '无偏差'
            const isEditing = editingReviewId === (review?.id || '')
            return (
              <div key={record.consultation.id} className={`bg-white rounded-xl shadow-sm p-4 border-l-4 ${hasDeviation ? 'border-l-rose-500' : 'border-l-emerald-400'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">{record.consultation.customerName}</span>
                    <span className="text-xs text-gray-400">{formatDate(record.consultation.completedAt || record.consultation.createdAt)}</span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${pathConfig[record.triageResult.recommendedPath]?.bg || 'bg-gray-100 text-gray-600'}`}>{pathConfig[record.triageResult.recommendedPath]?.label || record.triageResult.recommendedPath}</span>
                </div>
                {review && !isEditing && (
                  <>
                    {hasDeviation && <span className="inline-block text-xs bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full mb-2">{review.deviationType}</span>}
                    <p className="text-sm text-gray-700">{review.supervisorComment || '暂无评语'}</p>
                    {review.reviewedAt && <p className="text-xs text-gray-400 mt-2 flex items-center gap-1"><Clock className="w-3 h-3" />{formatDate(review.reviewedAt)}</p>}
                    <button onClick={() => startEdit(review.id, review)} className="mt-2 flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700"><MessageSquarePlus className="w-3 h-3" />添加评语</button>
                  </>
                )}
                {review && isEditing && (
                  <div className="space-y-2 mt-1">
                    <select value={editForm.deviationType} onChange={e => setEditForm(f => ({ ...f, deviationType: e.target.value }))} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400">
                      <option value="">选择偏差类型</option>
                      {deviationOptions.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                    <textarea value={editForm.supervisorComment} onChange={e => setEditForm(f => ({ ...f, supervisorComment: e.target.value }))} placeholder="输入主管评语..." rows={3} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none" />
                    <div className="flex gap-2">
                      <button onClick={() => saveEdit(review.id)} className="px-4 py-1.5 bg-amber-500 text-white text-xs rounded-lg hover:bg-amber-600">保存</button>
                      <button onClick={() => setEditingReviewId(null)} className="px-4 py-1.5 bg-gray-100 text-gray-600 text-xs rounded-lg hover:bg-gray-200">取消</button>
                    </div>
                  </div>
                )}
                {!review && (
                  <button onClick={() => handleAddReview(record.consultation.id)} className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700"><MessageSquarePlus className="w-3 h-3" />待评价</button>
                )}
              </div>
            )
          })}
          {filteredRecords.length === 0 && <p className="text-sm text-gray-400 text-center py-4">暂无反馈记录</p>}
        </div>
      </motion.div>
    </div>
  )
}
