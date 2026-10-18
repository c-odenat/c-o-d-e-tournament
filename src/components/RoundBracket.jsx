import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronRight, 
  Trophy, 
  Skull,
  Crown,
  Swords
} from 'lucide-react'
import { formatCurrency } from '../utils/formatters'
import { getTeamEmoji } from '../utils/teamNames'

const RoundBracket = ({ tournament }) => {
  if (!tournament) return null

  // Group legs by round
  const rounds = {}
  tournament.legs.forEach(leg => {
    const round = leg.round
    if (!rounds[round]) rounds[round] = []
    rounds[round].push(leg)
  })

  const maxRound = Math.max(...Object.keys(rounds).map(Number))

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-8 min-w-max p-4">
        {Array.from({ length: maxRound }, (_, i) => i + 1).map((roundNum) => (
          <motion.div
            key={roundNum}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: roundNum * 0.1 }}
            className="flex flex-col gap-4"
          >
            {/* Round Header */}
            <div className="text-center mb-2">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
                roundNum === tournament.currentRound 
                  ? 'bg-indigo-500/20 border border-indigo-500/30 text-indigo-400' 
                  : 'bg-slate-800/50 text-slate-400'
              }`}>
                {roundNum === maxRound && tournament.status === 'completed' ? (
                  <Crown className="w-4 h-4 text-amber-400" />
                ) : (
                  <Swords className="w-4 h-4" />
                )}
                <span className="font-semibold">Round {roundNum}</span>
              </div>
            </div>

            {/* Round Legs */}
            <div className="flex flex-col gap-3 relative">
              {(rounds[roundNum] || []).map((leg, index) => (
                <BracketCard 
                  key={leg.id} 
                  leg={leg} 
                  isCurrentRound={roundNum === tournament.currentRound}
                  showConnector={roundNum < maxRound && leg.status === 'profit'}
                />
              ))}

              {/* Empty state for future rounds */}
              {!rounds[roundNum] && (
                <div className="w-64 h-20 rounded-xl border-2 border-dashed border-slate-700 flex items-center justify-center text-slate-500">
                  <Trophy className="w-5 h-5 mr-2" />
                  Awaiting winners
                </div>
              )}
            </div>
          </motion.div>
        ))}

        {/* Champion Display */}
        {tournament.status === 'completed' && tournament.winner && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, type: 'spring' }}
            className="flex flex-col items-center justify-center"
          >
            <div className="text-center mb-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30 text-amber-400">
                <Crown className="w-4 h-4" />
                <span className="font-semibold">Champion</span>
              </div>
            </div>
            <motion.div
              animate={{ 
                boxShadow: [
                  '0 0 20px rgba(245, 158, 11, 0.3)',
                  '0 0 40px rgba(245, 158, 11, 0.6)',
                  '0 0 20px rgba(245, 158, 11, 0.3)'
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-72 p-6 rounded-2xl bg-gradient-to-br from-amber-500/20 to-yellow-600/20 border-2 border-amber-500/50"
            >
              <div className="text-center">
                <motion.span 
                  className="text-5xl block mb-3"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                >
                  🏆
                </motion.span>
                <span className="text-3xl mb-2 block">{getTeamEmoji(tournament.winner.name)}</span>
                <h3 className="text-xl font-bold text-white mb-2">{tournament.winner.name}</h3>
                <p className="text-amber-400 font-semibold text-lg">
                  {formatCurrency(tournament.winner.amount + tournament.winner.profitAmount)}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

const BracketCard = ({ leg, isCurrentRound, showConnector }) => {
  const emoji = getTeamEmoji(leg.name)

  const getCardStyle = () => {
    if (leg.eliminated) {
      return 'bg-red-900/30 border-red-500/40 opacity-70'
    }
    if (leg.status === 'profit') {
      return 'bg-emerald-900/30 border-emerald-500/40'
    }
    if (isCurrentRound && leg.status === 'pending') {
      return 'bg-indigo-900/30 border-indigo-500/40'
    }
    return 'bg-slate-800/50 border-slate-700/50'
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`relative w-64 p-4 rounded-xl border-2 transition-all ${getCardStyle()}`}
    >
      {/* Connector Line */}
      {showConnector && (
        <div className="absolute right-0 top-1/2 w-8 h-0.5 bg-gradient-to-r from-emerald-500 to-transparent transform translate-x-full" />
      )}

      <div className="flex items-center gap-3">
        <span className="text-2xl">{emoji}</span>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-white truncate">{leg.name}</h4>
          <p className="text-sm text-slate-400">
            {formatCurrency(leg.amount)}
            {leg.profitAmount > 0 && (
              <span className="text-emerald-400 ml-1">
                (+{formatCurrency(leg.profitAmount)})
              </span>
            )}
          </p>
        </div>
        <div>
          {leg.eliminated ? (
            <Skull className="w-5 h-5 text-red-400" />
          ) : leg.status === 'profit' ? (
            <Trophy className="w-5 h-5 text-emerald-400" />
          ) : (
            <ChevronRight className="w-5 h-5 text-slate-400" />
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default RoundBracket
