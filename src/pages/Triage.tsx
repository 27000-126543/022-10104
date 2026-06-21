import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, ArrowRight, FileText, Copy } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { triagePaths, emotionOptions } from '@/data/mockData'

const emotionLabelMap = Object.fromEntries(emotionOptions.map((e) => [e.id, e.label]))

const riskConfig: Record<string, { label: string; color: string }> = {
  green: { label: '低风险', color: 'text-green-600 bg-green-50' },
  yellow: { label: '中风险', color: 'text-yellow-600 bg-yellow-50' },
  red: { label: '高风险', color: 'text-red-600 bg-red-50' },
}

function generateReason(intent: string, pathId: string): string {
  const map: Record<string, Record<string, string>> = {
    anti_aging: {
      injection: '基于抗衰需求及顾客对自然效果的关注，推荐注射微整路径',
      laser: '建议光电联合方案改善胶原再生',
      surgery: '如松弛程度较重可考虑外科方案',
      skin_management: '建议先通过皮肤管理建立基础',
    },
    whitening: {
      laser: '光电方案对色素改善最为直接有效',
      skin_management: '皮肤管理可配合巩固美白效果',
      injection: '水光类注射可辅助提亮肤色',
      surgery: '美白需求通常无需外科干预',
    },
    contouring: {
      injection: '注射类项目对轮廓微调效果显著且恢复期短',
      surgery: '如骨性轮廓问题突出，可考虑外科方案',
      laser: '光电类对脂肪型轮廓问题有辅助作用',
      skin_management: '皮肤管理可改善面部紧致度辅助轮廓',
    },
    skin_repair: {
      skin_management: '皮肤管理是屏障修复和肤质改善的首选路径',
      laser: '光电可辅助促进修复和胶原再生',
      injection: '中胚层疗法可辅助皮肤修复',
      surgery: '肌肤修复通常无需外科干预',
    },
  }
  return map[intent]?.[pathId] || '综合评估后推荐此路径，建议进一步面诊确认方案'
}

export default function Triage() {
  const navigate = useNavigate()
  const { currentConsultation, currentProfile, currentRiskCheck, currentTriageResult, updateTriageResult, completeConsultation } = useStore()
  const [selectedPath, setSelectedPath] = useState<string>(currentTriageResult?.recommendedPath || '')
  const [reason, setReason] = useState(currentTriageResult?.reason || '')
  const [copied, setCopied] = useState(false)

  const intentKey = currentConsultation?.visitIntent || ''

  useEffect(() => {
    if (!selectedPath) return
    const r = generateReason(intentKey, selectedPath)
    setReason(r)
  }, [selectedPath, intentKey])

  useEffect(() => {
    if (!selectedPath) return
    const pathLabel = triagePaths.find((p) => p.id === selectedPath)?.label || ''
    const emotionLabel = emotionLabelMap[currentProfile?.emotion || ''] || '未评估'
    const risk = currentRiskCheck?.riskLevel || 'green'
    const riskLabel = riskConfig[risk]?.label || '未评估'
    const summary = [
      `顾客来意：${currentConsultation?.visitIntent || '未记录'}`,
      `标准诉求：${currentProfile?.standardTags?.join('、') || '无'}`,
      `顾客情绪：${emotionLabel}`,
      `核心顾虑：${currentProfile?.concern || '无'}`,
      `风险等级：${riskLabel}`,
      `推荐路径：${pathLabel}`,
    ].join('\n')
    updateTriageResult({ recommendedPath: selectedPath as any, reason, summary })
  }, [selectedPath, reason])

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

  return (
    <div className="max-w-lg mx-auto px-4 pb-24">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">分诊建议</h1>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {triagePaths.map((path) => {
          const isSelected = selectedPath === path.id
          return (
            <motion.button
              key={path.id}
              whileTap={{ scale: 0.96 }}
              animate={isSelected ? { scale: 1.03 } : { scale: 1 }}
              onClick={() => setSelectedPath(path.id)}
              className={`relative rounded-2xl p-4 text-left bg-gradient-to-br ${path.color} text-white shadow-md transition-shadow ${
                isSelected ? 'ring-3 ring-amber-400 shadow-lg' : ''
              }`}
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
            <SummaryRow label="顾客来意" value={currentConsultation.visitIntent} />
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
                  riskConfig[currentRiskCheck?.riskLevel || 'green']?.color
                }`}
              >
                {riskConfig[currentRiskCheck?.riskLevel || 'green']?.label}
              </span>
            </div>
            <SummaryRow
              label="推荐路径"
              value={triagePaths.find((p) => p.id === selectedPath)?.label || ''}
            />
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
      <span className="text-sm text-gray-800 font-medium">{value}</span>
    </div>
  )
}
