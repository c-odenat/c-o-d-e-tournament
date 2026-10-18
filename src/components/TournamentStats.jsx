import { motion } from 'framer-motion'
import { 
  Trophy, 
  Target, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Percent,
  Users,
  Skull
} from 'lucide-react'
import { formatCurrency, formatPercentage } from '../utils/formatters'

const StatCard = ({ icon: Icon, label, value, subValue, color = 'indigo' }) => {
  const colorClasses = {
    indigo: 'from-indigo-500 to-purple-600',
    emerald: 'from-emerald-500 to-teal-600',
    red: 'from-red-500 to-orange-600',
    amber: 'from-amber-500 to-yellow-600',
    blue: 'from-blue-500 to-cyan-600'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="card p-5"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-400 mb-1">{label}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
          {subValue && (
            <p className="text-sm text-slate-400 mt-1">{subValue}</p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </motion.div>
  )
}

const TournamentStats = ({ tournament, stats }) => {
  if (!tournament || !stats) return null

  const isProfit = stats.netPnL >= 0

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={DollarSign}
          label="Starting Amount"
          value={formatCurrency(tournament.startingAmount)}
          color="indigo"
        />
        <StatCard
          icon={isProfit ? TrendingUp : TrendingDown}
          label="Net P&L"
          value={formatCurrency(stats.netPnL)}
          subValue={`ROI: ${stats.roi}%`}
          color={isProfit ? 'emerald' : 'red'}
        />
        <StatCard
          icon={Target}
          label="Win Rate"
          value={formatPercentage(stats.winRate)}
          subValue={`${stats.profitableLegs} wins`}
          color="amber"
        />
        <StatCard
          icon={Trophy}
          label="Current Round"
          value={`Round ${tournament.currentRound}`}
          subValue={`${stats.activeLegs} remaining`}
          color="blue"
        />
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card p-4"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Total Profit</p>
              <p className="text-lg font-bold text-emerald-400">
                +{formatCurrency(stats.totalProfitAmount)}
              </p>
            </div>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((stats.totalProfitAmount / tournament.startingAmount) * 100, 100)}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="card p-4"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Total Loss</p>
              <p className="text-lg font-bold text-red-400">
                -{formatCurrency(stats.totalLossAmount)}
              </p>
            </div>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((stats.totalLossAmount / tournament.startingAmount) * 100, 100)}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-red-500 to-orange-400"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="card p-4"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Current Value</p>
              <p className="text-lg font-bold text-white">
                {formatCurrency(stats.totalCurrentValue)}
              </p>
            </div>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((stats.totalCurrentValue / tournament.startingAmount) * 100, 100)}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-400"
            />
          </div>
        </motion.div>
      </div>

      {/* Legs Summary */}
      <div className="grid grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-4 text-center"
        >
          <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <Trophy className="w-6 h-6 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-white">{stats.activeLegs}</p>
          <p className="text-sm text-slate-400">Active Legs</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-4 text-center"
        >
          <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-amber-500/20 flex items-center justify-center">
            <Target className="w-6 h-6 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-white">{stats.profitableLegs}</p>
          <p className="text-sm text-slate-400">Profitable</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-4 text-center"
        >
          <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-red-500/20 flex items-center justify-center">
            <Skull className="w-6 h-6 text-red-400" />
          </div>
          <p className="text-2xl font-bold text-white">{stats.eliminatedLegs}</p>
          <p className="text-sm text-slate-400">Eliminated</p>
        </motion.div>
      </div>
    </div>
  )
}

export default TournamentStats
