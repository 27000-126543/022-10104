import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, ArrowRight, FileText, Copy, Sparkles, Target } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { triagePaths, emotionOptions, visitIntents } from '@/data/mockData'

const emotionLabelMap = Object.fromEntries(emotionOptions.map((e) => [e.id, e.label]))

const injectionFearTags = ['怕僵', '自然效果优先', '过度填充顾虑', '渐进式改善需求']

const riskConfig: Record<string, { label: string; color: string }> = {
  green: { label: '低风险', color: 'text-green-600 bg-green-50' },
  yellow: { label: '中风险', color: 'text-yellow-600 bg-yellow-50' },
  red: { label: '高风险', color: 'text-red-600 bg-red-50' },
  combined: { label: '联合评估', color: 'text-amber-600 bg-amber-50' },
}

function generateReason(intent: string, pathId: string, tags: string[]): string {
  const hasFearTag = tags.some((t) => injectionFearTags.includes(t))
  const map: Record<string, Record<string, string>> = {
    anti_aging: {
      injection: hasFearTag
        ? '基于顾客对自然效果的关注和怕僵顾虑，推荐注射微整路径，由注射医生把控用量确保自然'
        : '基于抗衰需求及顾客对自然效果的关注，推荐注射微整路径',
      laser: '建议光电联合方案改善胶原再生',
      surgery: '如松弛程度较重可考虑外科方案',
      skin_management: '建议先通过皮肤管理建立基础',
      combined: '顾客需求多维，建议抗衰联合评估，由医生综合制定注射+光电方案',
    },
    whitening: {
      laser: '光电方案对色素改善最为直接有效',
      skin_management: '皮肤管理可配合巩固美白效果',
      injection: '水光类注射可辅助提亮肤色',
      surgery: '美白需求通常无需外科干预',
      combined: '美白需求可联合光电+皮肤管理，分层改善色素与肤质',
    },
    contouring: {
      injection: '注射类项目对轮廓微调效果显著且恢复期短',
      surgery: '如骨性轮廓问题突出，可考虑外科方案',
      laser: '光电类对脂肪型轮廓问题有辅助作用',
      skin_management: '皮肤管理可改善面部紧致度辅助轮廓',
      combined: '轮廓塑形可联合注射+光电，兼顾骨骼层与脂肪层改善',
    },
    skin_repair: {
      skin_management: '皮肤管理是屏障修复和肤质改善的首选路径',
      laser: '光电可辅助促进修复和胶原再生',
      injection: '中胚层疗法可辅助皮肤修复',
      surgery: '肌肤修复通常无需外科干预',
      combined: '肌肤修复可联合皮肤管理+光电，系统性改善屏障与质地',
    },
    acne: {
      skin_management: '痘肌管理首选皮肤管理路径，规范清洁与控油',
      laser: '光电可辅助消炎杀菌及改善痘印',
      injection: '中胚层疗法可辅助控油和抗炎',
      surgery: '痘肌通常无需外科干预',
      combined: '痘肌问题可联合皮肤管理+光电，同步控油与修复痘印',
    },
    body_sculpt: {
      laser: '光电类对局部脂肪消融有良好效果',
      injection: '溶脂针等注射可辅助局部塑形',
      surgery: '如脂肪量较大可考虑吸脂等外科方案',
      skin_management: '皮肤管理可辅助紧致塑形后皮肤',
      combined: '体雕塑身可联合光电+注射，分层次管理脂肪与紧致度',
    },
    eye_rejuvenation: {
      injection: '注射类可改善鱼尾纹及眼周细纹',
      laser: '光电可改善黑眼圈及眼周松弛',
      surgery: '眼袋及上睑松弛可考虑外科方案',
      skin_management: '皮肤管理可辅助眼周保湿与细纹改善',
      combined: '眼部年轻化可联合注射+光电，综合改善皱纹与松弛',
    },
    lip_enhancement: {
      injection: '玻尿酸注射是唇部塑形的首选方案',
      laser: '光电可辅助改善唇周暗沉',
      surgery: '唇部通常无需外科干预',
      skin_management: '皮肤管理可辅助唇周保湿与细纹淡化',
      combined: '唇部美化可联合注射+皮肤管理，兼顾唇形与唇周状态',
    },
    scar_repair: {
      laser: '光电是改善疤痕质地和颜色的有效手段',
      injection: '疤痕针等注射可辅助抑制增生',
      skin_management: '皮肤管理可辅助疤痕区域修复与保湿',
      surgery: '严重增生性疤痕可考虑外科切除重建',
      combined: '疤痕修复可联合光电+注射，多维度改善色泽与平整度',
    },
    hair_restoration: {
      skin_management: '头皮管理可改善毛囊环境辅助生发',
      injection: '中胚层疗法可营养毛囊促进生发',
      laser: '低能量激光可辅助激活毛囊',
      surgery: '严重脱发可考虑植发手术',
      combined: '毛发管理可联合注射+光电，系统性改善毛囊活性与头皮环境',
    },
  }
  return map[intent]?.[pathId] || '综合评估后推荐此路径，建议进一步面诊确认方案'
}

export default function Triage() {
  const navigate = useNavigate()
  const { currentConsultation, currentProfile, currentRiskCheck, currentTriageResult, updateTriageResult, completeConsultation, getSmartRecommendation } = useStore()
  const [selectedPath, setSelectedPath] = useState<string>(currentTriageResult?.recommendedPath || '')
  const [reason, setReason] = useState(currentTriageResult?.reason || '')
  const [smartRecommendation, setSmartRecommendation] = useState(getSmartRecommendation())
  const [copied, setCopied] = useState(false)

  const intentKey = currentConsultation?.visitIntent || ''
  const tags = currentProfile?.standardTags || []
  const riskLevel = currentRiskCheck?.riskLevel || 'green'

  useEffect(() => {
    const rec = getSmartRecommendation()
    setSmartRecommendation(rec)
    if (rec && rec.confidence === 'high' && !selectedPath) {
      setSelectedPath(rec.recommendedPath)
    }
  }, [currentConsultation, currentProfile?.standardTags, currentProfile?.rawDescription, riskLevel])

  useEffect(() => {
    if (!selectedPath) return
    const r = generateReason(intentKey, selectedPath, tags)
    setReason(r)
  }, [selectedPath, intentKey, tags])

  useEffect(() => {
    if (!selectedPath) return
    const pathLabel = triagePaths.find((p) => p.id === selectedPath)?.label || ''
    const emotionLabel = emotionLabelMap[currentProfile?.emotion || ''] || '未评估'
    const riskLabel = riskConfig[riskLevel]?.label || '未评估'
    const intentLabel = visitIntents.find((v) => v.id === intentKey)?.label || intentKey || '未记录'
    const conclusion = smartRecommendation?.conclusion || ''
    const summary = [
      `顾客来意：${intentLabel}`,
      `标准诉求：${currentProfile?.standardTags?.join('、') || '无'}`,
      `顾客情绪：${emotionLabel}`,
      `核心顾虑：${currentProfile?.concern || '无'}`,
      `风险等级：${riskLabel}`,
      `推荐路径：${pathLabel}`,
      `推荐理由：${reason}`,
      `分诊结论：${conclusion || '建议进一步面诊确认方案'}`,
    ].join('\n')
    updateTriageResult({ recommendedPath: selectedPath as any, reason, summary })
  }, [selectedPath, reason, smartRecommendation?.conclusion])

  const handleCopy = async () => {
    const text = currentTriageResult?.summary || ''
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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

  const intentLabel = visitIntents.find((v) => v.id === currentConsultation.visitIntent)?.label || currentConsultation.visitIntent
  const confidenceConfig = {
    high: { label: '高置信度', color: 'bg-green-500 text-white' },
    medium: { label: '中置信度', color: 'bg-blue-500 text-white' },
    low: { label: '低置信度', color: 'bg-gray-400 text-white' },
  }

  return (
    <div className="max-w-lg mx-auto px-4 pb-24">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">分诊建议</h1>

      <AnimatePresence>
        {smartRecommendation && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="mb-6 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-5 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-indigo-500" />
              <span className="font-bold text-gray-800">AI 智能推荐</span>
              <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${confidenceConfig[smartRecommendation.confidence].color}`}>
                {confidenceConfig[smartRecommendation.confidence].label}
              </span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-indigo-500" />
              <span className="text-sm font-semibold text-gray-700">
                {triagePaths.find((p) => p.id === smartRecommendation.recommendedPath)?.label}
              </span>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-700">
                推荐路径
              </span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">{smartRecommendation.reason}</p>
            <div className="rounded-xl bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-300 p-4">
              <div className="flex items-center gap-1.5 mb-1.5">
                <CheckCircle className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-semibold text-amber-700">分诊结论</span>
              </div>
              <p className="text-sm font-medium text-amber-800 leading-relaxed">{smartRecommendation.conclusion}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {triagePaths.map((path, index) => {
          const isSelected = selectedPath === path.id
          const isLast = index === triagePaths.length - 1 && triagePaths.length % 2 !== 0
          return (
            <motion.button
              key={path.id}
              whileTap={{ scale: 0.96 }}
              animate={isSelected ? { scale: 1.03 } : { scale: 1 }}
              onClick={() => setSelectedPath(path.id)}
              className={`relative rounded-2xl p-4 text-left bg-gradient-to-br ${path.color} text-white shadow-md transition-shadow ${
                isSelected ? 'ring-3 ring-amber-400 shadow-lg' : ''
              } ${isLast ? 'col-span-2' : ''}`}
            >
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-2 right-2"
                >
                  <CheckCircle className="w-5 h-5 text-amber-300" />
                </motion.div>
              )}
              <div className="text-3xl mb-2">{path.icon}</div>
              <div className="font-semibold text-sm">{path.label}</div>
              <div className="text-xs opacity-80 mt-1 leading-relaxed">{path.description}</div>
            </motion.button>
          )
        })}
      </div>

      {selectedPath && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="rounded-2xl bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg font-bold text-gray-800">
                {triagePaths.find((p) => p.id === selectedPath)?.label}
              </span>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-400 text-white">
                推荐
              </span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">{reason}</p>
          </div>
        </motion.div>
      )}

      {selectedPath && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-500" />
            面诊前摘要
          </h2>
          <div className="rounded-2xl bg-white border border-gray-200 p-5 shadow-sm space-y-2.5">
            <SummaryRow label="顾客来意" value={intentLabel} />
            <SummaryRow label="标准诉求" value={currentProfile?.standardTags?.join('、') || '无'} />
            <SummaryRow
              label="顾客情绪"
              value={emotionLabelMap[currentProfile?.emotion || ''] || '未评估'}
            />
            <SummaryRow label="核心顾虑" value={currentProfile?.concern || '无'} />
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">风险等级</span>
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  riskConfig[riskLevel]?.color
                }`}
              >
                {riskConfig[riskLevel]?.label}
              </span>
            </div>
            <SummaryRow
              label="推荐路径"
              value={triagePaths.find((p) => p.id === selectedPath)?.label || ''}
            />
            <SummaryRow label="推荐理由" value={reason} />
            <SummaryRow label="分诊结论" value={smartRecommendation?.conclusion || '建议进一步面诊确认方案'} />
            <div className="pt-2 border-t border-gray-100">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-sm text-amber-600 hover:text-amber-700 font-medium transition-colors"
              >
                <Copy className="w-4 h-4" />
                {copied ? '已复制' : '复制摘要'}
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {selectedPath && (
        <motion.button
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            completeConsultation()
            navigate('/')
          }}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 text-white font-bold text-base shadow-lg flex items-center justify-center gap-2 hover:shadow-xl transition-shadow"
        >
          完成接待并保存
          <ArrowRight className="w-5 h-5" />
        </motion.button>
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
