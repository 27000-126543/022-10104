import { useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, AlertCircle, CheckCircle2, Clock, ChevronRight, BarChart3 } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { mockConsultationHistory } from '@/data/mockData'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const pathColors: Record<string, string> = {
  skin_management: '#34d399',
  laser: '#8b5cf6',
  injection: '#3b82f6',
  surgery: '#f43f5e',
}

const pathLabels: Record<string, string> = {
  skin_management: '皮肤管理',
  laser: '光电治疗',
  injection: '注射微整',
  surgery: '外科手术',
}

const pathBgColors: Record<string, string> = {
  skin_management: 'bg-emerald-100 text-emerald-700',
  laser: 'bg-violet-100 text-violet-700',
  injection: 'bg-blue-100 text-blue-700',
  surgery: 'bg-rose-100 text-rose-700',
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

function formatShortDate(iso: string) {
  const d = new Date(iso)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

export default function Review() {
  const { consultations, reviews } = useStore()
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const completedCount = consultations.filter(c => c.status === 'completed').length
  const deviationCount = reviews.filter(r => r.deviationType && r.deviationType.trim() !== '').length
  const deviationRate = reviews.length > 0 ? Math.round((deviationCount / reviews.length) * 100) : 0

  const pathDistribution = mockConsultationHistory.reduce<Record<string, number>>((acc, item) => {
    acc[item.path] = (acc[item.path] || 0) + 1
    return acc
  }, {})
  const pieData = Object.entries(pathDistribution).map(([name, value]) => ({ name, value }))

  const today = new Date()
  const barData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() - (6 - i))
    const label = `${d.getMonth() + 1}/${d.getDate()}`
    return { day: label, count: Math.floor(Math.random() * 5) + 1 }
  })

  const stats = [
    { label: '总接待', value: consultations.length, icon: BarChart3, color: 'text-amber-500' },
    { label: '已完成', value: completedCount, icon: CheckCircle2, color: 'text-emerald-500' },
    { label: '偏差率', value: `${deviationRate}%`, icon: TrendingUp, color: 'text-rose-500' },
  ]

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-gray-900">学习复盘</h1>
        <p className="text-sm text-gray-500 mt-1">个人接待统计</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="grid grid-cols-3 gap-3">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-xl shadow-sm p-3 text-center">
            <s.icon className={`w-5 h-5 mx-auto mb-1 ${s.color}`} />
            <p className="text-xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500">{s.label}</p>
          </div>
        ))}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="bg-white rounded-xl shadow-sm p-4">
        <h2 className="text-base font-semibold text-gray-900 mb-3">分诊路径分布</h2>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70}
              innerRadius={40} paddingAngle={3} label={({ name }) => pathLabels[name] || name}>
              {pieData.map(entry => (
                <Cell key={entry.name} fill={pathColors[entry.name] || '#94a3b8'} />
              ))}
            </Pie>
            <Tooltip formatter={(v: number, n: string) => [v, pathLabels[n] || n]} />
          </PieChart>
        </ResponsiveContainer>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="bg-white rounded-xl shadow-sm p-4">
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
          {mockConsultationHistory.map(item => (
            <div key={item.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <button onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                className="w-full px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3 text-left">
                  {item.hasDeviation
                    ? <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                    : <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.customerName}</p>
                    <p className="text-xs text-gray-500">{formatDate(item.date)} · {item.visitIntent}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${pathBgColors[item.path] || 'bg-gray-100 text-gray-600'}`}>
                    {pathLabels[item.path] || item.path}
                  </span>
                  <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${expandedId === item.id ? 'rotate-90' : ''}`} />
                </div>
              </button>
              {expandedId === item.id && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                  className="px-4 pb-3 text-xs text-gray-600 border-t border-gray-100 pt-2">
                  <p>顾客姓名：{item.customerName}</p>
                  <p>到诊意图：{item.visitIntent}</p>
                  <p>分诊路径：{pathLabels[item.path] || item.path}</p>
                  <p>偏差标记：{item.hasDeviation ? '存在偏差' : '无偏差'}</p>
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <h2 className="text-base font-semibold text-gray-900 mb-3">主管反馈</h2>
        <div className="space-y-2">
          {reviews.map(r => {
            const hasDeviation = r.deviationType && r.deviationType.trim() !== ''
            return (
              <div key={r.id}
                className={`bg-white rounded-xl shadow-sm p-4 border-l-4 ${hasDeviation ? 'border-l-rose-500' : 'border-l-emerald-400'}`}>
                {hasDeviation && (
                  <span className="inline-block text-xs bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full mb-2">
                    {r.deviationType}
                  </span>
                )}
                <p className="text-sm text-gray-700">{r.supervisorComment || '暂无评语'}</p>
                {r.reviewedAt && (
                  <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                    <Clock className="w-3 h-3" />{formatDate(r.reviewedAt)}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </motion.div>
    </div>
  )
}
