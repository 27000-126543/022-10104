import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp, Search, Shield, AlertTriangle, ArrowRight } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { openingQuestions, promiseWarnings, qaLibrary, visitIntents } from '@/data/mockData'

export default function Reception() {
  const navigate = useNavigate()
  const { currentConsultation, setVisitIntent } = useStore()
  const [expandedQ, setExpandedQ] = useState<number | null>(null)
  const [expandedQA, setExpandedQA] = useState<number | null>(null)
  const [searchText, setSearchText] = useState('')
  const [warningIdx, setWarningIdx] = useState(0)

  const intent = currentConsultation?.visitIntent || 'anti_aging'
  const intentLabel = visitIntents.find(v => v.id === intent)?.label || intent

  useEffect(() => {
    const timer = setInterval(() => {
      setWarningIdx(i => (i + 1) % promiseWarnings.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  if (!currentConsultation) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12 text-center">
        <AlertTriangle className="w-12 h-12 text-gold-500 mx-auto mb-4" />
        <p className="text-gray-600 mb-6">当前没有进行中的咨询</p>
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gold-500 text-white rounded-xl hover:bg-gold-600 transition-colors"
        >
          返回首页开始咨询 <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    )
  }

  const questions = openingQuestions[intent] || []
  const filteredQA = qaLibrary.filter(
    item => item.q.includes(searchText) || item.a.includes(searchText) || item.category.includes(searchText)
  )

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-28">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">接待话术</h1>
        <p className="text-sm text-gray-500 mt-1">当前意图：{intentLabel}</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-hide">
        {visitIntents.map(v => (
          <button
            key={v.id}
            onClick={() => setVisitIntent(v.id)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              intent === v.id
                ? 'bg-gold-500 text-white'
                : 'bg-gold-50 text-gold-700 hover:bg-gold-100'
            }`}
          >
            {v.icon} {v.label}
          </button>
        ))}
      </div>

      <h2 className="text-lg font-semibold text-gray-800 mb-3">开场提问</h2>
      <div className="space-y-3 mb-8">
        {questions.map((item, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <button
              onClick={() => setExpandedQ(expandedQ === idx ? null : idx)}
              className="w-full flex items-center justify-between px-4 py-3 text-left"
            >
              <span className="text-sm font-medium text-gray-800">{item.question}</span>
              {expandedQ === idx ? (
                <ChevronUp className="w-4 h-4 text-gold-500 shrink-0" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
              )}
            </button>
            <AnimatePresence>
              {expandedQ === idx && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <ul className="px-4 pb-3 space-y-2">
                    {item.followUps.map((fu, fi) => (
                      <li key={fi} className="flex items-start gap-2 text-sm text-gray-600">
                        <ArrowRight className="w-3.5 h-3.5 text-gold-400 mt-0.5 shrink-0" />
                        {fu}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-30">
        <div className="max-w-lg mx-auto px-4 pb-4">
          <motion.div
            key={warningIdx}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-3 bg-white rounded-xl shadow-lg border-l-4 border-coral-400 px-4 py-3"
          >
            <Shield className="w-5 h-5 text-coral-400 shrink-0" />
            <span className="text-sm text-coral-700 font-medium">{promiseWarnings[warningIdx]}</span>
          </motion.div>
        </div>
      </div>

      <h2 className="text-lg font-semibold text-gray-800 mb-3">Q&amp;A 知识库</h2>
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          placeholder="搜索问题..."
          className="w-full pl-9 pr-4 py-2.5 bg-white rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gold-300"
        />
      </div>
      <div className="space-y-3">
        {filteredQA.map((item, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <button
              onClick={() => setExpandedQA(expandedQA === idx ? null : idx)}
              className="w-full flex items-center justify-between px-4 py-3 text-left"
            >
              <span className="text-sm font-medium text-gray-800">{item.q}</span>
              {expandedQA === idx ? (
                <ChevronUp className="w-4 h-4 text-gold-500 shrink-0" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
              )}
            </button>
            <AnimatePresence>
              {expandedQA === idx && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <p className="px-4 pb-3 text-sm text-gray-600 leading-relaxed">{item.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
        {filteredQA.length === 0 && (
          <p className="text-center text-sm text-gray-400 py-6">未找到匹配的问答</p>
        )}
      </div>
    </div>
  )
}
