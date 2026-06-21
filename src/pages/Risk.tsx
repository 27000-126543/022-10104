import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle2, Circle, AlertTriangle, ShieldAlert, AlertCircle, ArrowRight, Phone, ShieldCheck, ShieldQuestion } from 'lucide-react'
import { useStore } from '@/store/useStore'

const riskConfig = {
  green: { label: '低风险', color: 'text-mint-400', bg: 'bg-mint-50', border: 'border-mint-400', icon: ShieldCheck, iconColor: 'text-mint-500', pulse: false },
  yellow: { label: '需关注', color: 'text-amber-400', bg: 'bg-amber-50', border: 'border-amber-400', icon: ShieldQuestion, iconColor: 'text-amber-500', pulse: true },
  red: { label: '需医生介入', color: 'text-coral-400', bg: 'bg-red-50', border: 'border-coral-400', icon: ShieldAlert, iconColor: 'text-red-500', pulse: true },
}

export default function Risk() {
  const navigate = useNavigate()
  const currentConsultation = useStore((s) => s.currentConsultation)
  const currentRiskCheck = useStore((s) => s.currentRiskCheck)
  const toggleHistoryCheck = useStore((s) => s.toggleHistoryCheck)
  const toggleContraindication = useStore((s) => s.toggleContraindication)

  if (!currentConsultation || !currentRiskCheck) {
    return (
      <div className="max-w-lg mx-auto p-6 flex flex-col items-center justify-center min-h-[60vh] text-gray-400">
        <AlertCircle className="w-12 h-12 mb-3" />
        <p>暂无进行中的咨询</p>
      </div>
    )
  }

  const { riskLevel, historyChecks, contraindicationChecks, doctorInterventionNeeded, interventionReason } = currentRiskCheck
  const config = riskConfig[riskLevel]
  const checkedCount = historyChecks.filter((c) => c.checked).length
  const firstThreeChecked = historyChecks.slice(0, 3).every((c) => c.checked)
  const anyContraindicationPresent = contraindicationChecks.some((c) => c.present)
  const presentCount = contraindicationChecks.filter((c) => c.present).length

  const summaryText = riskLevel === 'red'
    ? `存在${presentCount}项禁忌症，需要医生介入评估`
    : riskLevel === 'yellow'
      ? '关键病史尚未全部确认，请继续核对'
      : '所有风险项已确认，可安全进入分诊'

  return (
    <div className="max-w-lg mx-auto p-6 space-y-6">
      <h1 className="text-xl font-bold text-gray-800">风险核对</h1>

      <div className="flex flex-col items-center py-4">
        <motion.div
          className={`w-28 h-28 rounded-full border-4 ${config.border} flex items-center justify-center ${config.pulse ? 'animate-pulse' : ''}`}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
        >
          <span className={`text-lg font-bold ${config.color}`}>{config.label}</span>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <h2 className="text-lg font-semibold text-gray-700 mb-3">病史追问</h2>
        <div className="space-y-3">
          {historyChecks.map((item, i) => (
            <motion.div
              key={i}
              className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm cursor-pointer active:scale-[0.98] transition-transform"
              onClick={() => toggleHistoryCheck(i)}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              {item.checked ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-amber-400 shrink-0" />
              )}
              <span className={`text-sm ${item.checked ? 'text-gray-500 line-through' : 'text-gray-700'}`}>
                {item.item}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {contraindicationChecks.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h2 className="text-lg font-semibold text-gray-700 mb-3">禁忌症确认</h2>
          <div className="space-y-3">
            {contraindicationChecks.map((item, i) => (
              <motion.div
                key={i}
                className={`p-3 rounded-xl shadow-sm border ${item.present ? 'bg-red-50 border-red-300' : 'bg-white border-gray-100'}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {item.present ? (
                      <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-gray-300 shrink-0" />
                    )}
                    <span className={`text-sm ${item.present ? 'text-red-700 font-medium' : 'text-gray-700'}`}>
                      {item.item}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <button
                      onClick={() => { if (item.present) toggleContraindication(i) }}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                        !item.present
                          ? 'bg-emerald-500 text-white shadow-sm'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      无
                    </button>
                    <button
                      onClick={() => { if (!item.present) toggleContraindication(i) }}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                        item.present
                          ? 'bg-red-500 text-white shadow-sm'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      有
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {doctorInterventionNeeded && (
        <motion.div
          className="p-4 bg-red-50 border-2 border-red-300 rounded-2xl"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <ShieldAlert className="w-5 h-5 text-red-600" />
            <span className="font-bold text-red-700">建议医生提前介入</span>
          </div>
          {interventionReason && <p className="text-sm text-red-600 mb-3">{interventionReason}</p>}
          <div className="flex items-center gap-2 text-red-500">
            <Phone className="w-4 h-4" />
            <span className="text-sm">请联系医生沟通</span>
          </div>
        </motion.div>
      )}

      <motion.div
        className={`p-4 rounded-2xl border-2 ${config.border} ${config.bg}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <div className="flex items-center gap-3">
          <config.icon className={`w-6 h-6 ${config.iconColor} shrink-0`} />
          <div>
            <p className={`font-bold ${config.color}`}>{config.label}</p>
            <p className="text-sm text-gray-600 mt-0.5">{summaryText}</p>
          </div>
        </div>
      </motion.div>

      <div className="text-center text-sm text-gray-500">
        已完成 {checkedCount}/{historyChecks.length} 项病史核对{contraindicationChecks.length > 0 ? `，${presentCount}项禁忌症确认` : ''}
      </div>

      <button
        onClick={() => navigate('/triage')}
        disabled={!firstThreeChecked}
        className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
          firstThreeChecked
            ? 'bg-gold-500 text-white active:scale-[0.98]'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}
      >
        进入分诊建议
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  )
}
