import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Check, 
  X,
  Skull,
  Crown,
  Zap
} from 'lucide-react'
import { formatCurrency } from '../utils/formatters'
import { getTeamEmoji } from '../utils/teamNames'

const LegCard = ({ leg, onUpdateStatus, disabled }) => {
  const [showProfitInput, setShowProfitInput] = useState(false)
  const [profitAmount, setProfitAmount] = useState('')
  const [isAnimating, setIsAnimating] = useState(false)

  const handleProfitClick = () => {
    setShowProfitInput(true)
  }

  const handleProfitSubmit = () => {
    const profit = parseFloat(profitAmount)
    if (!isNaN(profit) && profit > 0) {
      setIsAnimating(true)
      setTimeout(() => {
        onUpdateStatus(leg.id, 'profit', profit)
        setShowProfitInput(false)
        setProfitAmount('')
        setIsAnimating(false)
      }, 300)
    }
  }

  const handleLossClick = () => {
    setIsAnimating(true)
    setTimeout(() => {
      onUpdateStatus(leg.id, 'loss', 0)
      setIsAnimating(false)
    }, 300)
  }

  const getCardStyle = () => {
    if (leg.eliminated) {
      return 'bg-red-500/5 border-red-500/20'
    }
    if (leg.status === 'profit') {
      return 'bg-emerald-500/5 border-emerald-500/20'
    }
    return 'bg-[#1a1a24] border-white/5 hover:border-cyan-500/30'
  }

  const emoji = getTeamEmoji(leg.name)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ 
        opacity: leg.eliminated ? 0.5 : 1, 
        scale: isAnimating ? 1.02 : 1
      }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      className={`relative p-4 rounded-xl border transition-all ${getCardStyle()}`}
    >
      {/* Status Badge */}
      {leg.status !== 'pending' && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center ${
            leg.status === 'profit' ? 'bg-emerald-500' : 'bg-red-500'
          }`}
        >
          {leg.status === 'profit' ? (
            <Check className="w-3 h-3 text-white" />
          ) : (
            <X className="w-3 h-3 text-white" />
          )}
        </motion.div>
      )}

      {/* Team Info */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg bg-[#12121a] flex items-center justify-center text-xl">
          {emoji}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white text-sm truncate">{leg.name}</h3>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">
            Round {leg.round} • #{leg.position + 1}
          </p>
        </div>
        {leg.status === 'profit' && (
          <Crown className="w-4 h-4 text-yellow-500" />
        )}
        {leg.eliminated && (
          <Skull className="w-4 h-4 text-red-400" />
        )}
      </div>

      {/* Amount Display */}
      <div className="mb-4 p-3 rounded-lg bg-[#12121a]">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider">Trade Amount</span>
          {leg.profitAmount > 0 && (
            <span className="badge badge-success text-[10px]">
              +{formatCurrency(leg.profitAmount)}
            </span>
          )}
        </div>
        <p className="text-xl font-bold text-white mt-1">
          {formatCurrency(leg.amount)}
        </p>
      </div>

      {/* Action Buttons */}
      {leg.status === 'pending' && !disabled && (
        <AnimatePresence mode="wait">
          {!showProfitInput ? (
            <motion.div
              key="buttons"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex gap-2"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleLossClick}
                className="flex-1 py-2.5 px-3 rounded-lg btn-danger text-white text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                <TrendingDown className="w-4 h-4" />
                LOSS
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleProfitClick}
                className="flex-1 py-2.5 px-3 rounded-lg btn-success text-white text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                <TrendingUp className="w-4 h-4" />
                PROFIT
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="input"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-2"
            >
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="number"
                  value={profitAmount}
                  onChange={(e) => setProfitAmount(e.target.value)}
                  placeholder="Profit amount"
                  className="w-full pl-9 pr-3 py-2 text-sm"
                  autoFocus
                />
              </div>
              <div className="flex gap-2">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowProfitInput(false)}
                  className="flex-1 py-2 rounded-lg btn-ghost text-xs font-medium"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleProfitSubmit}
                  className="flex-1 py-2 rounded-lg btn-success text-white text-xs font-semibold flex items-center justify-center gap-1"
                >
                  <Check className="w-3 h-3" />
                  Confirm
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Status Display */}
      {leg.status !== 'pending' && (
        <div className={`py-2.5 px-3 rounded-lg text-center text-xs font-semibold flex items-center justify-center gap-1.5 ${
          leg.status === 'profit' 
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
            : 'bg-red-500/10 text-red-400 border border-red-500/20'
        }`}>
          {leg.status === 'profit' ? (
            <>
              <Zap className="w-3 h-3" />
              WINNER +{formatCurrency(leg.profitAmount)}
            </>
          ) : (
            <>
              <Skull className="w-3 h-3" />
              ELIMINATED
            </>
          )}
        </div>
      )}
    </motion.div>
  )
}

export default LegCard
