import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp, Search, Shield, AlertTriangle, ArrowRight, Plus, Pencil, Trash2, X, Check } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { openingQuestions, promiseWarnings, visitIntents } from '@/data/mockData'

interface QAFormState {
  category: string
  q: string
  a: string
}

const emptyForm: QAFormState = { category: '', q: '', a: '' }

export default function Reception() {
  const navigate = useNavigate()
  const { currentConsultation, setVisitIntentWithCascade, qaItems, addQA, editQA, deleteQA } = useStore()
  const [expandedQ, setExpandedQ] = useState<number | null>(null)
  const [expandedQA, setExpandedQA] = useState<string | null>(null)
  const [searchText, setSearchText] = useState('')
  const [warningIdx, setWarningIdx] = useState(0)
  const [showAddForm, setShowAddForm] = useState(false)
  const [addForm, setAddForm] = useState<QAFormState>(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<QAFormState>(emptyForm)
  const [showIntentConfirm, setShowIntentConfirm] = useState(false)
  const [pendingIntent, setPendingIntent] = useState<string | null>(null)

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
  const filteredQA = qaItems.filter(
    item => item.q.includes(searchText) || item.a.includes(searchText) || item.category.includes(searchText)
  )

  const handleIntentClick = (intentId: string) => {
    if (intentId === intent) return
    setPendingIntent(intentId)
    setShowIntentConfirm(true)
  }

  const handleIntentConfirm = () => {
    if (pendingIntent) {
      setVisitIntentWithCascade(pendingIntent)
    }
    setShowIntentConfirm(false)
    setPendingIntent(null)
  }

  const handleIntentCancel = () => {
    setShowIntentConfirm(false)
    setPendingIntent(null)
  }

  const handleAddSave = () => {
    if (!addForm.q.trim() || !addForm.a.trim()) return
    addQA({ id: 'qa-' + Date.now(), category: addForm.category.trim(), q: addForm.q.trim(), a: addForm.a.trim() })
    setAddForm(emptyForm)
    setShowAddForm(false)
  }

  const handleEditStart = (item: typeof qaItems[number]) => {
    setEditingId(item.id)
    setEditForm({ category: item.category, q: item.q, a: item.a })
    setExpandedQA(item.id)
  }

  const handleEditSave = () => {
    if (!editingId || !editForm.q.trim() || !editForm.a.trim()) return
    editQA(editingId, { category: editForm.category.trim(), q: editForm.q.trim(), a: editForm.a.trim() })
    setEditingId(null)
    setEditForm(emptyForm)
  }

  const handleEditCancel = () => {
    setEditingId(null)
    setEditForm(emptyForm)
  }

  const QAForm = ({ form, setForm, onSave, onCancel }: {
    form: QAFormState
    setForm: React.Dispatch<React.SetStateAction<QAFormState>>
    onSave: () => void
    onCancel: () => void
  }) => (
    <div className="bg-gold-50 rounded-xl p-4 space-y-3 border border-gold-200">
      <input
        value={form.category}
        onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
        placeholder="分类（如：抗衰、注射）"
        className="w-full px-3 py-2 text-sm bg-white rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gold-300"
      />
      <input
        value={form.q}
        onChange={e => setForm(f => ({ ...f, q: e.target.value }))}
        placeholder="问题"
        className="w-full px-3 py-2 text-sm bg-white rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gold-300"
      />
      <textarea
        value={form.a}
        onChange={e => setForm(f => ({ ...f, a: e.target.value }))}
        placeholder="回答"
        rows={3}
        className="w-full px-3 py-2 text-sm bg-white rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gold-300 resize-none"
      />
      <div className="flex gap-2 justify-end">
        <button
          onClick={onCancel}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <X className="w-3.5 h-3.5" /> 取消
        </button>
        <button
          onClick={onSave}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-white bg-gold-500 rounded-lg hover:bg-gold-600 transition-colors"
        >
          <Check className="w-3.5 h-3.5" /> 保存
        </button>
      </div>
    </div>
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
            onClick={() => handleIntentClick(v.id)}
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

      <AnimatePresence>
        {showIntentConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">确认切换</h3>
              </div>
              <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                变更顾客来意将重置风险核对禁忌症和分诊推荐，确认要切换吗？
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleIntentCancel}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleIntentConfirm}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-gold-500 rounded-xl hover:bg-gold-600 transition-colors"
                >
                  确认
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          placeholder="搜索问题..."
          className="w-full pl-9 pr-4 py-2.5 bg-white rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gold-300"
        />
      </div>

      <button
        onClick={() => { setShowAddForm(!showAddForm); setAddForm(emptyForm) }}
        className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 mb-4 text-sm font-medium text-gold-600 bg-gold-50 rounded-xl border border-dashed border-gold-300 hover:bg-gold-100 transition-colors"
      >
        <Plus className="w-4 h-4" /> 新增问答
      </button>

      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden mb-4"
          >
            <QAForm
              form={addForm}
              setForm={setAddForm}
              onSave={handleAddSave}
              onCancel={() => { setShowAddForm(false); setAddForm(emptyForm) }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        {filteredQA.map(item => (
          <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {editingId === item.id ? (
              <div className="p-4">
                <QAForm
                  form={editForm}
                  setForm={setEditForm}
                  onSave={handleEditSave}
                  onCancel={handleEditCancel}
                />
              </div>
            ) : (
              <>
                <div className="flex items-center">
                  <button
                    onClick={() => setExpandedQA(expandedQA === item.id ? null : item.id)}
                    className="flex-1 flex items-center justify-between px-4 py-3 text-left"
                  >
                    <span className="text-sm font-medium text-gray-800">{item.q}</span>
                    {expandedQA === item.id ? (
                      <ChevronUp className="w-4 h-4 text-gold-500 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                    )}
                  </button>
                  <div className="flex items-center gap-1 pr-3">
                    <button
                      onClick={() => handleEditStart(item)}
                      className="p-1.5 text-gray-400 hover:text-gold-500 hover:bg-gold-50 rounded-lg transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteQA(item.id)}
                      className="p-1.5 text-gray-400 hover:text-coral-500 hover:bg-coral-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <AnimatePresence>
                  {expandedQA === item.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-3">
                        {item.category && (
                          <span className="inline-block px-2 py-0.5 mb-2 text-xs font-medium text-gold-700 bg-gold-100 rounded-full">
                            {item.category}
                          </span>
                        )}
                        <p className="text-sm text-gray-600 leading-relaxed">{item.a}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}
          </div>
        ))}
        {filteredQA.length === 0 && (
          <p className="text-center text-sm text-gray-400 py-6">未找到匹配的问答</p>
        )}
      </div>
    </div>
  )
}
