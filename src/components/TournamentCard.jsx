import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { 
  Trophy, 
  Play, 
  BarChart3, 
  Trash2, 
  RefreshCw,
  Calendar,
  DollarSign,
  Users,
  CheckCircle2
} from 'lucide-react'
import { formatCurrency, formatDate } from '../utils/formatters'

const TournamentCard = ({ tournament, onDelete, onReset }) => {
  const activeLegs = tournament.legs.filter(l => !l.eliminated).length
  const completedLegs = tournament.legs.filter(l => l.status !== 'pending').length
  const progress = (completedLegs / tournament.numberOfLegs) * 100

  const isCompleted = tournament.status === 'completed'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className={`card p-6 relative overflow-hidden ${
        isCompleted ? 'border-emerald-500/30' : ''
      }`}
    >
      {/* Completion Badge */}
      {isCompleted && (
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          className="absolute top-4 right-4"
        >
          <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-white" />
          </div>
        </motion.div>
      )}

      {/* Tournament Header */}
      <div className="flex items-start gap-4 mb-4">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
          isCompleted 
            ? 'bg-gradient-to-br from-emerald-500 to-teal-600' 
            : 'bg-gradient-to-br from-indigo-500 to-purple-600'
        }`}>
          <Trophy className="w-7 h-7 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-white mb-1">{tournament.name}</h3>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(tournament.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center p-3 rounded-xl bg-slate-800/50">
          <DollarSign className="w-5 h-5 mx-auto text-indigo-400 mb-1" />
          <p className="text-lg font-bold text-white">{formatCurrency(tournament.startingAmount)}</p>
          <p className="text-xs text-slate-400">Starting</p>
        </div>
        <div className="text-center p-3 rounded-xl bg-slate-800/50">
          <Users className="w-5 h-5 mx-auto text-amber-400 mb-1" />
          <p className="text-lg font-bold text-white">{activeLegs}/{tournament.numberOfLegs}</p>
          <p className="text-xs text-slate-400">Active Legs</p>
        </div>
        <div className="text-center p-3 rounded-xl bg-slate-800/50">
          <Trophy className="w-5 h-5 mx-auto text-emerald-400 mb-1" />
          <p className="text-lg font-bold text-white">Round {tournament.currentRound}</p>
          <p className="text-xs text-slate-400">Current</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-slate-400">Progress</span>
          <span className="text-white font-medium">{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className={`h-full ${
              isCompleted 
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400' 
                : 'bg-gradient-to-r from-indigo-500 to-purple-400'
            }`}
          />
        </div>
      </div>

      {/* Winner Display */}
      {isCompleted && tournament.winner && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-4 p-4 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏆</span>
            <div>
              <p className="text-sm text-amber-400">Champion</p>
              <p className="font-bold text-white">{tournament.winner.name}</p>
              <p className="text-sm text-amber-400">
                Final Value: {formatCurrency(tournament.winner.amount + tournament.winner.profitAmount)}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Link to={`/tournament/${tournament.id}`} className="flex-1">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 ${
              isCompleted ? 'btn-success' : 'btn-primary'
            } text-white`}
          >
            <Play className="w-5 h-5" />
            {isCompleted ? 'View Results' : 'Continue'}
          </motion.button>
        </Link>
        
        <Link to={`/analysis/${tournament.id}`}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="py-3 px-4 rounded-xl bg-slate-700 text-white hover:bg-slate-600 transition-colors"
            title="View Analysis"
          >
            <BarChart3 className="w-5 h-5" />
          </motion.button>
        </Link>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onReset(tournament.id)}
          className="py-3 px-4 rounded-xl bg-slate-700 text-white hover:bg-slate-600 transition-colors"
          title="Reset Tournament"
        >
          <RefreshCw className="w-5 h-5" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onDelete(tournament.id)}
          className="py-3 px-4 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
          title="Delete Tournament"
        >
          <Trash2 className="w-5 h-5" />
        </motion.button>
      </div>
    </motion.div>
  )
}

export default TournamentCard
