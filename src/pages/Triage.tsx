import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles, Target, CheckCircle, ArrowRight, FileText, Copy, ShieldAlert, BookOpenCheck,
  MessageCircle, Tag, AlertTriangle, GitBranch, ChevronDown, ChevronUp
} from 'lucide-react'
import { useStore } from '@/store/useStore'
import { triagePaths, emotionOptions, visitIntents } from '@/data/mockData'

const emotionLabelMap = Object.fromEntries(emotionOptions.map((e) => [e.id, e.label]))
const riskConfig: Record<string, { label: string; color: string }> = {
  green: { label: '低风险', color: 'text-green-600 bg-green-50' },
  yellow: { label: '中风险', color: 'text-yellow-600 bg-yellow-50' },
  red: { label: '高风险', color: 'text-red-600 bg-red-50' },
  combined: { label: '联合评估', color: 'text-amber-600 bg-amber-50' },
}
const standardTagsList = [
  '抗衰年轻化', '面部松弛改善', '皱纹减少', '自然效果优先', '过度填充顾虑', '渐进式改善需求',
  '轮廓塑形', '咬肌肥大/脂肪堆积鉴别', '下颌线优化', '肌肤修复', '屏障修复', '肤色改善',
  '色素管理', '美白提亮', '防晒需求', '体雕塑身', '脂肪管理', '局部塑形',
  '眼部年轻化', '眼袋改善', '眶隔脂肪管理', '痘肌管理', '色素沉着', '肤质改善',
  '唇部美化', '唇形优化', '丰唇需求', '疤痕修复', '创伤修复', '皮肤重建',
]
const highlightKeyPhrases = (text: string, tags: string[]) => {
  if (!text?.trim()) return <span className="text-gray-400">暂未记录</span>
  let result: (string | JSX.Element)[] = [text]
  tags.filter(t => text.includes(t)).forEach(tag => {
    const newResult: (string | JSX.Element)[] = []
    result.forEach(seg => {
      if (typeof seg === 'string') {
        seg.split(new RegExp(`(${tag})`, 'g')).forEach((p, i) => {
          if (p === tag) newResult.push(<mark key={`${tag}-${i}`} className="bg-amber-100 text-amber-800 px-1 rounded font-medium">{p}</mark>)
          else if (p) newResult.push(p)
        })
      } else newResult.push(seg)
    })
    result = newResult
  })
  return <>{result}</>
}
const genericReasons: Record<string, string> = {
  skin_management: '选择皮肤管理路径，温和改善肤质基础',
  laser: '选择光电治疗路径，针对性解决色素/胶原问题',
  injection: '选择注射微整路径，快速改善轮廓/皱纹',
  surgery: '选择外科手术路径，结构性调整',
  combined: '选择联合评估路径，综合多维度方案',
}
const SAFETY_CONCLUSION = '安全优先：存在高风险因素，需医生提前介入评估'
const SAFETY_REASON = '顾客存在高风险因素，安全为第一原则，需联合评估确认治疗的安全性，建议由医生提前介入评估。'
const confidenceConfig = {
  high: { label: '高置信度', color: 'bg-green-500 text-white' },
  medium: { label: '中置信度', color: 'bg-blue-500 text-white' },
  low: { label: '低置信度', color: 'bg-gray-400 text-white' },
}

export default function Triage() {
  const navigate = useNavigate()
  const { currentConsultation, currentProfile, currentRiskCheck, currentTriageResult, updateTriageResult, completeConsultation, getSmartRecommendation } = useStore()
  const smartRecommendation = useMemo(() => getSmartRecommendation(), [])
  const isRed = currentRiskCheck?.riskLevel === 'red'
  const effectiveRec = useMemo(() => {
    if (isRed) return { recommendedPath: 'combined', reason: SAFETY_REASON, conclusion: SAFETY_CONCLUSION, confidence: 'high' as const }
    return smartRecommendation
  }, [smartRecommendation, isRed])

  const [selectedPath, setSelectedPath] = useState(effectiveRec?.recommendedPath || '')
  const [reason, setReason] = useState(effectiveRec?.reason || '')
  const [conclusion, setConclusion] = useState(effectiveRec?.conclusion || '')
  const [copied, setCopied] = useState(false)
  const [chainOpen, setChainOpen] = useState(true)

  const intentKey = currentConsultation?.visitIntent || ''
  const tags = currentProfile?.standardTags || []
  const rawDescription = currentProfile?.rawDescription || ''
  const riskLevel = currentRiskCheck?.riskLevel || 'green'
  const presentContraindications = currentRiskCheck?.contraindicationChecks?.filter(c => c.present).map(c => c.item) || []
  const matchedKeywords = useMemo(() => rawDescription.trim() ? standardTagsList.filter(t => rawDescription.includes(t)) : [], [rawDescription])
  const intentLabel = visitIntents.find((v) => v.id === currentConsultation?.visitIntent)?.label || currentConsultation?.visitIntent || ''
  const displayConclusion = isRed ? SAFETY_CONCLUSION : (effectiveRec?.conclusion || '')
  const displayReason = isRed ? SAFETY_REASON : (effectiveRec?.reason || '')
  const displayPath = isRed ? 'combined' : (effectiveRec?.recommendedPath || '')
  const displayPathLabel = triagePaths.find((p) => p.id === displayPath)?.label || ''
  const selectedPathLabel = triagePaths.find((p) => p.id === selectedPath)?.label || ''

  useEffect(() => {
    if (effectiveRec) {
      setSelectedPath(effectiveRec.recommendedPath)
      setReason(effectiveRec.reason)
      setConclusion(effectiveRec.conclusion)
    }
  }, [intentKey, tags, rawDescription, riskLevel, effectiveRec])

  useEffect(() => {
    if (!selectedPath) return
    const finalConclusion = isRed ? SAFETY_CONCLUSION : (conclusion || '建议进一步面诊确认方案')
    const summary = [
      `顾客来意：${visitIntents.find((v) => v.id === intentKey)?.label || intentKey || '未记录'}`,
      `标准诉求：${tags.join('、') || '无'}`,
      `顾客情绪：${emotionLabelMap[currentProfile?.emotion || ''] || '未评估'}`,
      `核心顾虑：${currentProfile?.concern || '无'}`,
      `风险等级：${riskConfig[riskLevel]?.label || '未评估'}`,
      `推荐路径：${selectedPathLabel}`,
      `推荐理由：${reason}`,
      `分诊结论：${finalConclusion}`,
    ].join('\n')
    updateTriageResult({ recommendedPath: selectedPath as any, reason, summary })
  }, [selectedPath, reason, conclusion, riskLevel])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(currentTriageResult?.summary || '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSelectPath = (pathId: string) => {
    const finalPath = isRed ? 'combined' : pathId
    setSelectedPath(finalPath)
    if (finalPath === effectiveRec?.recommendedPath) {
      setReason(effectiveRec.reason)
      setConclusion(effectiveRec.conclusion)
    } else {
      setReason(genericReasons[finalPath] || '综合评估后推荐此路径')
      setConclusion(isRed ? SAFETY_CONCLUSION : '建议面诊医生确认最终方案')
    }
  }

  if (!currentConsultation) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center text-gray-400">
        <FileText className="w-12 h-12 mx-auto mb-4 opacity-40" />
        <p className="text-lg">暂无进行中的接待</p>
        <p className="text-sm mt-2">请先开始新的接待流程</p>
      </div>
    )
  }

  const StepIcon = ({ color, bg, children }: { color: string; bg: string; children: React.ReactNode }) => (
    <div className={`w-10 h-10 rounded-full ${bg} flex items-center justify-center shrink-0 z-10`}>
      <div className={color}>{children}</div>
    </div>
  )
  const Arrow = () => (
    <div className="flex justify-center py-1 relative z-10">
      <ArrowRight className="w-5 h-5 text-gray-300" />
    </div>
  )
  const Chip = ({ children, color = 'bg-gray-50 text-gray-700 border-gray-200' }: { children: React.ReactNode; color?: string }) => (
    <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${color}`}>{children}</span>
  )

  return (
    <div className="max-w-lg mx-auto px-4 pb-24">
      <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-bold text-gray-800 mb-6 text-center">分诊建议</motion.h1>

      <AnimatePresence>
        {isRed && (
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="mb-4 rounded-2xl bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm font-bold text-red-700 leading-relaxed flex-1">🚨 {displayConclusion}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {effectiveRec && (
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="mb-6 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-indigo-500" />
              <span className="font-bold text-gray-800">AI 智能推荐</span>
              <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${confidenceConfig[effectiveRec.confidence].color}`}>{confidenceConfig[effectiveRec.confidence].label}</span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-indigo-500" />
              <span className="text-sm font-semibold text-gray-700">{displayPathLabel}</span>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-700">推荐路径</span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">{displayReason}</p>
            <div className="rounded-xl bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-300 p-4">
              <div className="flex items-center gap-1.5 mb-1.5">
                <CheckCircle className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-semibold text-amber-700">分诊结论</span>
              </div>
              <p className="text-sm font-medium text-amber-800 leading-relaxed">{displayConclusion}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {effectiveRec && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <button onClick={() => setChainOpen(!chainOpen)} className="w-full flex items-center justify-between rounded-2xl bg-white border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2">
                <BookOpenCheck className="w-5 h-5 text-emerald-500" />
                <span className="font-semibold text-gray-800">推理依据链</span>
              </div>
              {chainOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </button>
            <AnimatePresence>
              {chainOpen && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="mt-3 rounded-2xl bg-white border border-gray-200 p-4">
                    <div className="relative">
                      <div className="absolute left-5 top-8 bottom-8 w-0.5 bg-gradient-to-b from-sky-200 via-violet-200 via-amber-200 to-emerald-200" />

                      <div className="relative flex gap-3 pb-2">
                        <StepIcon bg="bg-sky-100" color="text-sky-600"><MessageCircle className="w-5 h-5" /></StepIcon>
                        <div className="flex-1 pt-1">
                          <p className="text-xs font-semibold text-sky-700 mb-2">📝 顾客原话关键词</p>
                          {matchedKeywords.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">{matchedKeywords.map((k, i) => <Chip key={i} color="bg-amber-50 text-amber-700 border-amber-200">{k}</Chip>)}</div>
                          ) : <p className="text-sm text-gray-400">暂未记录</p>}
                        </div>
                      </div>
                      <Arrow />
                      <div className="relative flex gap-3 pb-2">
                        <StepIcon bg="bg-violet-100" color="text-violet-600"><Tag className="w-5 h-5" /></StepIcon>
                        <div className="flex-1 pt-1">
                          <p className="text-xs font-semibold text-violet-700 mb-2">🏷️ 画像标签匹配</p>
                          {tags.length > 0 ? (
                            <>
                              <div className="flex flex-wrap gap-1.5 mb-1.5">{tags.map((t, i) => <Chip key={i} color="bg-violet-50 text-violet-700 border-violet-200">{t}</Chip>)}</div>
                              <p className="text-xs text-gray-500">匹配到 {tags.length} 个标准诉求标签</p>
                            </>
                          ) : <p className="text-sm text-gray-400">暂未整理</p>}
                        </div>
                      </div>
                      <Arrow />
                      <div className="relative flex gap-3 pb-2">
                        <StepIcon bg={isRed ? 'bg-red-100' : riskLevel === 'yellow' ? 'bg-yellow-100' : 'bg-green-100'} color={isRed ? 'text-red-600' : riskLevel === 'yellow' ? 'text-yellow-600' : 'text-green-600'}>
                          <AlertTriangle className="w-5 h-5" />
                        </StepIcon>
                        <div className="flex-1 pt-1">
                          <p className={`text-xs font-semibold mb-2 ${isRed ? 'text-red-700' : riskLevel === 'yellow' ? 'text-yellow-700' : 'text-green-700'}`}>⚠️ 风险核对结论</p>
                          <Chip color={riskConfig[riskLevel]?.color || ''}>{riskConfig[riskLevel]?.label}</Chip>
                          {isRed && presentContraindications.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {presentContraindications.map((c, i) => (
                                <span key={i} className="inline-flex items-center gap-1 bg-red-50 text-red-600 text-xs px-2 py-0.5 rounded font-medium">
                                  <ShieldAlert className="w-3 h-3" />{c}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <Arrow />
                      <div className="relative flex gap-3">
                        <StepIcon bg="bg-emerald-100" color="text-emerald-600"><GitBranch className="w-5 h-5" /></StepIcon>
                        <div className="flex-1 pt-1">
                          <p className="text-xs font-semibold text-emerald-700 mb-2">🎯 分诊路径推导</p>
                          <div className="mb-1.5"><Chip color="bg-emerald-50 text-emerald-700 border-emerald-200">{displayPathLabel}</Chip></div>
                          <p className="text-xs text-gray-600">综合以上 → 推荐{displayPathLabel}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {triagePaths.map((path, index) => {
          const isSelected = selectedPath === path.id
          const isLast = index === triagePaths.length - 1
          const isDisabled = isRed && path.id !== 'combined'
          return (
            <motion.button
              key={path.id}
              whileTap={{ scale: isDisabled ? 1 : 0.96 }}
              animate={isSelected ? { scale: 1.03 } : { scale: 1 }}
              onClick={() => !isDisabled && handleSelectPath(path.id)}
              className={`relative rounded-2xl p-4 text-left bg-gradient-to-br ${path.color} text-white shadow-md transition-shadow ${isSelected ? 'ring-3 ring-amber-400 shadow-lg' : ''} ${isLast ? 'col-span-2' : ''} ${isDisabled ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              {isSelected && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-2 right-2"><CheckCircle className="w-5 h-5 text-amber-300" /></motion.div>}
              <div className="text-3xl mb-2">{path.icon}</div>
              <div className="font-semibold text-sm">{path.label}</div>
              <div className="text-xs opacity-80 mt-1 leading-relaxed">{path.description}</div>
              {isDisabled && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-2xl">
                  <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded-full font-semibold">高风险锁定</span>
                </div>
              )}
            </motion.button>
          )
        })}
      </div>

      {selectedPath && (
        <>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <div className="rounded-2xl bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg font-bold text-gray-800">{selectedPathLabel}</span>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-400 text-white">推荐</span>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{reason}</p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
            <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2"><FileText className="w-5 h-5 text-amber-500" />面诊前摘要</h2>
            <div className="rounded-2xl bg-white border border-gray-200 p-5 shadow-sm space-y-2.5">
              <SummaryRow label="顾客来意" value={intentLabel} />
              <SummaryRow label="标准诉求" value={tags.join('、') || '无'} />
              <SummaryRow label="顾客情绪" value={emotionLabelMap[currentProfile?.emotion || ''] || '未评估'} />
              <SummaryRow label="核心顾虑" value={currentProfile?.concern || '无'} />
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">风险等级</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${riskConfig[riskLevel]?.color}`}>{riskConfig[riskLevel]?.label}</span>
              </div>
              <SummaryRow label="推荐路径" value={selectedPathLabel} />
              <SummaryRow label="推荐理由" value={reason} />
              <SummaryRow label="分诊结论" value={isRed ? SAFETY_CONCLUSION : (conclusion || '建议进一步面诊确认方案')} />
              <div className="pt-2 border-t border-gray-100">
                <button onClick={handleCopy} className="flex items-center gap-1.5 text-sm text-amber-600 hover:text-amber-700 font-medium transition-colors">
                  <Copy className="w-4 h-4" />{copied ? '已复制' : '复制摘要'}
                </button>
              </div>
            </div>
          </motion.div>

          <motion.button
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => { completeConsultation(); navigate('/') }}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 text-white font-bold text-base shadow-lg flex items-center justify-center gap-2 hover:shadow-xl transition-shadow"
          >
            完成接待并保存<ArrowRight className="w-5 h-5" />
          </motion.button>
        </>
      )}
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm text-gray-800 font-medium text-right max-w-[60%]">{value}</span>
    </div>
  )
}
