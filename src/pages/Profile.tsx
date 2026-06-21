import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Tag, AlertCircle, Heart, ArrowRight, X } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { tagMapping, emotionOptions } from '@/data/mockData'

const vagueIndicators = ['顾虑', '需求', '鉴别', '管理', '优先', '改善', '优化']
const followUpSuggestions = ['预算范围', '恢复期要求', '既往填充史', '期望自然度', '是否接受维持治疗']

export default function Profile() {
  const navigate = useNavigate()
  const { currentConsultation, currentProfile, updateProfile } = useStore()
  const [input, setInput] = useState(currentProfile?.rawDescription || '')

  if (!currentConsultation) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <p className="text-gray-400 mb-4">暂无进行中的咨询</p>
        <button onClick={() => navigate('/')} className="text-gold-600 underline">返回首页</button>
      </div>
    )
  }

  const handleAnalyze = () => {
    const matched: string[] = []
    Object.entries(tagMapping).forEach(([key, tags]) => {
      if (input.includes(key)) matched.push(...tags)
    })
    const unique = [...new Set(matched)]
    updateProfile({ rawDescription: input, standardTags: unique })
  }

  const removeTag = (tag: string) => {
    const updated = (currentProfile?.standardTags || []).filter(t => t !== tag)
    updateProfile({ standardTags: updated })
  }

  const tags = currentProfile?.standardTags || []
  const vagueTags = tags.filter(t => vagueIndicators.some(v => t.includes(v)))
  const standardTags = tags.filter(t => !vagueIndicators.some(v => t.includes(v)))

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
      <h1 className="text-xl font-bold text-gray-800">顾客画像</h1>

      <section className="space-y-3">
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="输入顾客原话，如'想显年轻但怕僵'…"
          className="w-full h-28 rounded-xl border border-gray-200 bg-white p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gold-300 placeholder:text-gray-300"
        />
        <button
          onClick={handleAnalyze}
          className="flex items-center gap-2 px-4 py-2 bg-gold-500 text-white rounded-lg text-sm font-medium hover:bg-gold-600 transition-colors"
        >
          <Tag size={16} /> 整理诉求
        </button>
      </section>

      {tags.length > 0 && (
        <section>
          <div className="flex flex-wrap gap-2">
            {standardTags.map(tag => (
              <motion.span
                key={tag}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-gold-100 text-gold-700"
              >
                {tag}
                <button onClick={() => removeTag(tag)} className="hover:text-gold-900"><X size={12} /></button>
              </motion.span>
            ))}
            {vagueTags.map(tag => (
              <motion.span
                key={tag}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border border-dashed border-gray-300 text-gray-500 bg-gray-50"
              >
                {tag}
                <button onClick={() => removeTag(tag)} className="hover:text-gray-700"><X size={12} /></button>
              </motion.span>
            ))}
          </div>
        </section>
      )}

      {vagueTags.length > 0 && (
        <section className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-amber-700 font-medium text-sm">
            <AlertCircle size={16} /> 还需了解
          </div>
          <div className="flex flex-wrap gap-2">
            {followUpSuggestions.map(s => (
              <span key={s} className="px-3 py-1 rounded-full text-xs bg-amber-100 text-amber-700">{s}</span>
            ))}
          </div>
        </section>
      )}

      <section className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <Heart size={16} className="text-coral-400" /> 情绪记录
        </div>
        <div className="flex justify-between">
          {emotionOptions.map(opt => {
            const selected = currentProfile?.emotion === opt.id
            return (
              <motion.button
                key={opt.id}
                whileTap={{ scale: 0.9 }}
                onClick={() => updateProfile({ emotion: opt.id as any })}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                  selected ? 'ring-2 ring-gold-500 scale-110 bg-gold-50' : 'hover:bg-gray-50'
                }`}
              >
                <span className="text-2xl">{opt.icon}</span>
                <span className={`text-[10px] ${selected ? 'text-gold-700 font-medium' : 'text-gray-400'}`}>{opt.label}</span>
              </motion.button>
            )
          })}
        </div>
      </section>

      <section>
        <input
          value={currentProfile?.concern || ''}
          onChange={e => updateProfile({ concern: e.target.value })}
          placeholder="记录核心诉求…"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gold-300 placeholder:text-gray-300"
        />
      </section>

      <button
        onClick={() => navigate('/risk')}
        className="w-full flex items-center justify-center gap-2 py-3 bg-gold-500 text-white rounded-xl font-medium hover:bg-gold-600 transition-colors"
      >
        进入风险核对 <ArrowRight size={18} />
      </button>
    </div>
  )
}
