import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Clock, Users, BookOpen, AlertCircle, ChevronRight } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { visitIntents } from '@/data/mockData'

const getGreeting = () => {
  const h = new Date().getHours()
  if (h < 6) return '夜深了'
  if (h < 9) return '早上好'
  if (h < 12) return '上午好'
  if (h < 14) return '中午好'
  if (h < 18) return '下午好'
  return '晚上好'
}

const formatDate = () => {
  const d = new Date()
  const weekdays = ['日', '一', '二', '三', '四', '五', '六']
  return `${d.getMonth() + 1}月${d.getDate()}日 周${weekdays[d.getDay()]}`
}

const reminders = [
  { title: '待复盘咨询', desc: '顾客A的抗衰咨询需要复盘', border: 'border-l-gold-400', icon: Clock, color: 'text-gold-500' },
  { title: '主管反馈', desc: '顾客B的咨询有偏差备注', border: 'border-l-coral-400', icon: AlertCircle, color: 'text-coral-500' },
  { title: '知识库更新', desc: '新增3条光电类问答', border: 'border-l-mint-400', icon: BookOpen, color: 'text-mint-500' },
]

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }

export default function Home() {
  const navigate = useNavigate()
  const { consultations, startConsultation } = useStore()
  const [showModal, setShowModal] = useState(false)

  const completedCount = consultations.filter(c => c.status === 'completed').length
  const reviewPendingCount = 1

  const handleIntent = (id: string) => {
    startConsultation(id)
    setShowModal(false)
    navigate('/reception')
  }

  return (
    <div className="max-w-lg mx-auto min-h-screen bg-gray-50 pb-8">
      <motion.div
        className="bg-gradient-to-b from-gold-50 to-white px-5 pt-12 pb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <p className="text-gray-500 text-sm">{formatDate()}</p>
        <h1 className="text-2xl font-bold text-gray-800 mt-1">
          {getGreeting()}，咨询师小李
        </h1>
      </motion.div>

      <motion.div
        className="px-5 -mt-2 space-y-3"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={item} className="grid grid-cols-3 gap-3">
          {[
            { icon: Users, num: completedCount, label: '已接待', color: 'text-gold-500' },
            { icon: Clock, num: 1, label: '待接待', color: 'text-coral-500' },
            { icon: BookOpen, num: reviewPendingCount, label: '待复盘', color: 'text-mint-500' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl shadow-sm p-4 flex flex-col items-center gap-1">
              <s.icon className={`w-5 h-5 ${s.color}`} />
              <span className="text-2xl font-bold text-gray-800">{s.num}</span>
              <span className="text-xs text-gray-500">{s.label}</span>
            </div>
          ))}
        </motion.div>

        <motion.div variants={item}>
          <button
            onClick={() => setShowModal(true)}
            className="w-full bg-gradient-to-r from-gold-400 to-gold-500 text-white rounded-2xl py-4 flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-transform"
          >
            <Plus className="w-5 h-5" />
            <span className="text-lg font-semibold">开始新接待</span>
          </button>
        </motion.div>

        <motion.div variants={item}>
          <h2 className="text-base font-semibold text-gray-700 mb-2">待办提醒</h2>
          <div className="space-y-2">
            {reminders.map(r => (
              <div
                key={r.title}
                className={`bg-white rounded-xl shadow-sm p-4 flex items-center gap-3 border-l-4 ${r.border}`}
              >
                <r.icon className={`w-5 h-5 ${r.color} shrink-0`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800">{r.title}</p>
                  <p className="text-xs text-gray-500 truncate">{r.desc}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/40" onClick={() => setShowModal(false)} />
            <motion.div
              className="relative bg-white rounded-t-3xl w-full max-w-lg p-6 pb-8"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">选择就诊意图</h3>
                <button onClick={() => setShowModal(false)} className="text-gray-400 text-xl leading-none">&times;</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {visitIntents.map(intent => (
                  <button
                    key={intent.id}
                    onClick={() => handleIntent(intent.id)}
                    className="bg-gold-50 text-gold-700 border border-gold-200 rounded-full px-4 py-2 text-sm font-medium hover:bg-gold-100 active:scale-95 transition-all"
                  >
                    {intent.icon} {intent.label}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
