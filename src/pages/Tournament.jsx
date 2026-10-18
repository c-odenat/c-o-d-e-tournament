import { useMemo, useState, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Confetti from 'react-confetti'
import { 
  Trophy, 
  ArrowRight, 
  BarChart3, 
  RefreshCw,
  Home,
  ChevronLeft,
  Zap,
  Crown,
  Target,
  AlertCircle,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  Check,
  Flag,
  Sparkles,
  PartyPopper,
  X
} from 'lucide-react'
import { useTournament } from '../context/TournamentContext'
import { formatCurrency }  from '../utils/formatters'
import { getTeamEmoji } from '../utils/teamNames'

const Tournament = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { 
    getTournament, 
    updateLegStatus,
    clearLegStatus,
    advanceToNextRound, 
    getTournamentStats,
    resetTournament,
    finishTournament
  } = useTournament()

  const [showConfetti, setShowConfetti] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const [celebrationData, setCelebrationData] = useState(null)
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight })
  const [openProfitInputs, setOpenProfitInputs] = useState({}) // { legId: profitAmount }
  const [updateKey, setUpdateKey] = useState(0)

  const tournament = getTournament(id)
  const stats = tournament ? getTournamentStats(id) : null

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight })
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (tournament?.status === 'completed') {
      setShowConfetti(true)
      const timer = setTimeout(() => setShowConfetti(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [tournament?.status])

  if (!tournament) {
    return (
      <div className="card">
        <div className="card-body text-center" style={{ padding: '60px 20px' }}>
          <div className="empty-state-icon" style={{ marginBottom: '20px' }}>
            <AlertCircle className="w-10 h-10" style={{ color: 'var(--accent-danger)' }} />
          </div>
          <h3 style={{ fontSize: '20px', marginBottom: '10px', color: 'var(--text-dark)' }}>Tournament Not Found</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>The tournament you're looking for doesn't exist.</p>
          <Link to="/">
            <button className="btn btn-primary">
              <Home className="w-4 h-4" />
              Go Home
            </button>
          </Link>
        </div>
      </div>
    )
  }

  // All legs that are in current round (including just-eliminated ones)
  const currentRoundLegs = tournament.legs.filter(
    l => l.round === tournament.currentRound
  )
  // Active legs only (not eliminated)
  const activeCurrentRoundLegs = currentRoundLegs.filter(l => !l.eliminated)
  // Check if all legs in current round have been decided (profit or loss)
  const allCurrentRoundComplete = currentRoundLegs.every(l => l.status !== 'pending')
  const hasWinners = currentRoundLegs.some(l => l.status === 'profit')
  const isCompleted = tournament.status === 'completed'
  const isFinished = tournament.status === 'finished'
  const isArchived = isCompleted || isFinished

  const maxRound = useMemo(() => {
    const fromHistory = tournament.legs.flatMap(l => l.history?.map(h => h.round) || [])
    const maxHistoryRound = fromHistory.length ? Math.max(...fromHistory) : 1
    return Math.max(tournament.currentRound, maxHistoryRound)
  }, [tournament, updateKey])

  const rounds = useMemo(() => {
    const getLegState = (leg, round) => {
      // For current round, always use live leg data
      if (round === tournament.currentRound && leg.round === tournament.currentRound && !leg.eliminated) {
        return {
          status: leg.status,
          amount: leg.amount,
          profitAmount: leg.profitAmount || 0,
          isCurrent: true
        }
      }

      // For past rounds, use history
      const entry = leg.history?.find(h => h.round === round)
      if (entry) {
        return {
          status: entry.status,
          amount: entry.amount,
          profitAmount: entry.profitAmount || 0,
          isCurrent: false
        }
      }

      return null
    }

    const roundCount = isArchived ? maxRound : tournament.currentRound
    const allRounds = []

    for (let r = 1; r <= roundCount; r += 1) {
      // Get all legs in this round
      const legsInRound = tournament.legs
        .map((leg) => {
          const state = getLegState(leg, r)
          if (!state) return null
          return { leg, state }
        })
        .filter(Boolean)
        .sort((a, b) => a.leg.position - b.leg.position) // Sort by original position

      // Calculate matches based on actual legs in this round
      const matchCount = Math.ceil(legsInRound.length / 2)
      const matches = Array.from({ length: matchCount }, () => [null, null])

      // Place legs sequentially in matches
      legsInRound.forEach((item, index) => {
        const matchIndex = Math.floor(index / 2)
        const side = index % 2
        matches[matchIndex][side] = item
      })

      allRounds.push({ round: r, matches })
    }

    return allRounds
  }, [tournament, isArchived, maxRound, updateKey])

  const handleAdvanceRound = () => {
    advanceToNextRound(id)
  }

  const handleReset = () => {
    if (confirm('Are you sure you want to reset this tournament? All progress will be lost.')) {
      resetTournament(id)
      // Reset profit input state and force re-render (same as handleClearStatus)
      setOpenProfitInputs({})
      setUpdateKey(prev => prev + 1)
    }
  }

  const handleFinishTournament = () => {
    if (confirm('Are you sure you want to finish this tournament? It will be archived and you can view it later.')) {
      // Calculate net P&L before finishing
      const currentStats = getTournamentStats(id)
      const netPnL = currentStats?.netPnL || 0
      const isProfit = netPnL > 0

      finishTournament(id)

      if (isProfit) {
        setCelebrationData({
          netPnL,
          totalProfit: currentStats.totalProfitAmount,
          winRate: currentStats.winRate
        })
        setShowCelebration(true)
        setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 8000)
      }
    }
  }

  const closeCelebration = () => {
    setShowCelebration(false)
    setCelebrationData(null)
  }

  const handleMarkLoss = (legId) => {
    updateLegStatus(id, legId, 'loss', 0)
    // Close profit input for this leg if open
    setOpenProfitInputs(prev => {
      const updated = { ...prev }
      delete updated[legId]
      return updated
    })
  }

  const handleOpenProfit = (legId) => {
    setOpenProfitInputs(prev => ({
      ...prev,
      [legId]: ''
    }))
  }

  const handleProfitAmountChange = (legId, value) => {
    setOpenProfitInputs(prev => ({
      ...prev,
      [legId]: value
    }))
  }

  const handleConfirmProfit = (legId) => {
    const profitAmount = openProfitInputs[legId] || ''
    const profit = parseFloat(profitAmount)
    
    // Error handling
    if (!profitAmount || profitAmount.trim() === '') {
      alert('Please enter a profit amount')
      return
    }
    
    if (Number.isNaN(profit)) {
      alert('Please enter a valid number')
      return
    }
    
    if (profit <= 0) {
      alert('Profit amount must be greater than 0')
      return
    }

    updateLegStatus(id, legId, 'profit', profit)
    // Close this profit input
    setOpenProfitInputs(prev => {
      const updated = { ...prev }
      delete updated[legId]
      return updated
    })
  }

  const handleCancelProfit = (legId) => {
    setOpenProfitInputs(prev => {
      const updated = { ...prev }
      delete updated[legId]
      return updated
    })
  }

  const handleClearStatus = (legId, opponentLegId) => {
    // Clear the leg status
    clearLegStatus(id, legId)
    // Also clear opponent if they were auto-marked as loss
    if (opponentLegId) {
      const opponent = tournament.legs.find(l => l.id === opponentLegId)
      if (opponent && opponent.status === 'loss' && opponent.round === tournament.currentRound) {
        clearLegStatus(id, opponentLegId)
      }
    }
    // Reset profit input state and force re-render
    setOpenProfitInputs({})
    setUpdateKey(prev => prev + 1)
  }

  return (
    <div className="space-y-5">
      {/* Confetti Effect */}
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={500}
          gravity={0.2}
          colors={['#5fbeaa', '#81c868', '#ffbd4a', '#34d3eb', '#ffd700', '#ff6b6b']}
        />
      )}

      {/* Celebration Modal */}
      <AnimatePresence>
        {showCelebration && celebrationData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="celebration-overlay"
            onClick={closeCelebration}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.5, opacity: 0, y: 50 }}
              transition={{ type: 'spring', damping: 15, stiffness: 300 }}
              className="celebration-modal"
              onClick={e => e.stopPropagation()}
            >
              <button className="celebration-close" onClick={closeCelebration}>
                <X className="w-5 h-5" />
              </button>
              
              <div className="celebration-sparkles">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="sparkle"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ 
                      opacity: [0, 1, 0], 
                      scale: [0, 1, 0],
                      x: Math.random() * 300 - 150,
                      y: Math.random() * 300 - 150
                    }}
                    transition={{ 
                      duration: 2, 
                      delay: Math.random() * 2,
                      repeat: Infinity,
                      repeatDelay: Math.random() * 3
                    }}
                  />
                ))}
              </div>

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="celebration-icon"
              >
                <PartyPopper className="w-12 h-12" />
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="celebration-title"
              >
                Congratulations! 🎉
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="celebration-subtitle"
              >
                You finished in profit!
              </motion.p>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
                className="celebration-stats"
              >
                <div className="celebration-stat highlight">
                  <Sparkles className="w-5 h-5" />
                  <span className="stat-value">+{formatCurrency(celebrationData.netPnL)}</span>
                  <span className="stat-label">Net Profit</span>
                </div>
                <div className="celebration-stat">
                  <TrendingUp className="w-4 h-4" />
                  <span className="stat-value">{formatCurrency(celebrationData.totalProfit)}</span>
                  <span className="stat-label">Total Earned</span>
                </div>
                <div className="celebration-stat">
                  <Target className="w-4 h-4" />
                  <span className="stat-value">{celebrationData.winRate}%</span>
                  <span className="stat-label">Win Rate</span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="celebration-actions"
              >
                <button className="btn btn-primary" onClick={closeCelebration}>
                  <Trophy className="w-4 h-4" />
                  View Tournament
                </button>
                <Link to="/">
                  <button className="btn btn-white">
                    <Home className="w-4 h-4" />
                    Go Home
                  </button>
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <Link to="/">
            <button className="btn btn-white">
              <ChevronLeft className="w-4 h-4" />
            </button>
          </Link>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 className="page-title" style={{ margin: 0 }}>{tournament.name}</h1>
              {isCompleted && <span className="badge badge-success">Completed</span>}
              {isFinished && <span className="badge badge-info">Finished</span>}
            </div>
            <p className="page-subtitle" style={{ margin: '5px 0 0' }}>
              {formatCurrency(tournament.startingAmount)} • {tournament.numberOfLegs} Legs
              {isFinished && tournament.netPnL !== undefined && (
                <span style={{ 
                  marginLeft: '10px', 
                  color: tournament.netPnL >= 0 ? 'var(--accent-success)' : 'var(--accent-danger)',
                  fontWeight: 600
                }}>
                  • Net: {tournament.netPnL >= 0 ? '+' : ''}{formatCurrency(tournament.netPnL)}
                </span>
              )}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <Link to={`/analysis/${id}`}>
            <button className="btn btn-white">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </button>
          </Link>
          {!isArchived && (
            <button onClick={handleFinishTournament} className="btn btn-warning">
              <Flag className="w-4 h-4" />
              Finish
            </button>
          )}
          <button onClick={() => window.location.reload()} className="btn btn-white" title="Refresh page">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Champion Banner */}
      {isCompleted && tournament.winner && (
        <div className="champion-card">
          <div className="champion-emoji">{getTeamEmoji(tournament.winner.name)}</div>
          <div className="champion-info">
            <h3>
              <Crown className="w-5 h-5" style={{ color: 'var(--accent-warning)' }} />
              {tournament.winner.name}
            </h3>
            <p>
              Tournament Champion • Final: {formatCurrency(tournament.winner.amount + tournament.winner.profitAmount)}
            </p>
          </div>
        </div>
      )}

      {/* Finished Banner */}
      {isFinished && tournament.winner && (
        <div className="champion-card" style={{ 
          background: tournament.netPnL >= 0 
            ? 'linear-gradient(135deg, rgba(129, 200, 104, 0.1), rgba(95, 190, 170, 0.1))'
            : 'linear-gradient(135deg, rgba(240, 80, 80, 0.1), rgba(200, 100, 100, 0.1))',
          borderColor: tournament.netPnL >= 0 ? 'var(--accent-success)' : 'var(--accent-danger)'
        }}>
          <div className="champion-emoji">{tournament.netPnL >= 0 ? '🏆' : '📊'}</div>
          <div className="champion-info">
            <h3>
              <Flag className="w-5 h-5" style={{ color: tournament.netPnL >= 0 ? 'var(--accent-success)' : 'var(--accent-danger)' }} />
              Tournament Finished
            </h3>
            <p>
              {tournament.netPnL >= 0 ? 'Profit' : 'Loss'}: {tournament.netPnL >= 0 ? '+' : ''}{formatCurrency(tournament.netPnL || 0)} • 
              Best Performer: {tournament.winner.name}
            </p>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      {stats && (
        <div className="stats-grid" style={{ marginBottom: '12px' }}>
          <div className="stat-card">
            <div className="stat-icon primary">
              <Target className="w-5 h-5" />
            </div>
            <div className="stat-content">
              <h3>{stats.winRate}%</h3>
              <p>Win Rate</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon info">
              <Users className="w-5 h-5" />
            </div>
            <div className="stat-content">
              <h3>{stats.activeLegs}</h3>
              <p>Active Legs</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon success">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="stat-content">
              <h3 style={{ color: 'var(--accent-success)' }}>+{formatCurrency(stats.totalProfitAmount)}</h3>
              <p>Total Profit</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon danger">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div className="stat-content">
              <h3 style={{ color: 'var(--accent-danger)' }}>-{formatCurrency(stats.totalLossAmount)}</h3>
              <p>Total Loss</p>
            </div>
          </div>
        </div>
      )}

      {/* Round Progress - Compact inline bar */}
      {!isArchived && (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '15px', 
          padding: '12px 16px',
          background: '#fff',
          borderRadius: '8px',
          boxShadow: 'var(--shadow)'
        }}>
          <div style={{ 
            width: '36px', 
            height: '36px', 
            background: 'var(--accent-primary)', 
            borderRadius: '8px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 700,
            fontSize: '14px',
            flexShrink: 0
          }}>
            R{tournament.currentRound}
          </div>
          <div style={{ fontSize: '14px', color: 'var(--text-dark)', fontWeight: 500 }}>
            {currentRoundLegs.filter(l => l.status !== 'pending').length}/{currentRoundLegs.length} completed
          </div>
          <div style={{ flex: 1, maxWidth: '300px' }}>
            <div className="progress-bar" style={{ height: '8px' }}>
              <div 
                className="progress-fill" 
                style={{ width: `${(currentRoundLegs.filter(l => l.status !== 'pending').length / currentRoundLegs.length) * 100}%` }} 
              />
            </div>
          </div>
          {allCurrentRoundComplete && hasWinners && (
            <button onClick={handleAdvanceRound} className="btn btn-success btn-sm">
              <Trophy className="w-4 h-4" />
              Advance
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Full Width Bracket - No Card Wrapper */}
      <div className="bracket-container" key={`bracket-${updateKey}`}>
        <div className="bracket-grid">
          {rounds.map((r) => (
            <div key={`round-${r.round}-${updateKey}`} className="round-column">
              <div className="round-header">
                <h4>Round {r.round}</h4>
                <span>{r.round === tournament.currentRound && !isCompleted ? 'Current' : `${r.matches.length} matches`}</span>
              </div>
              <div className="round-body">
                {r.matches.map((pair, idx) => {
                  const top = pair[0]
                  const bottom = pair[1]
                  const topIsWinner = top?.state.status === 'profit'
                  const bottomIsWinner = bottom?.state.status === 'profit'
                  const isCurrentRound = r.round === tournament.currentRound && !isArchived

                  return (
                    <div key={`match-${r.round}-${idx}-${updateKey}`} className="match-card">
                      <MatchSide
                        key={`top-${top?.leg?.id || idx}-${updateKey}`}
                        item={top}
                        isWinner={topIsWinner}
                        isLoser={top?.state.status === 'loss'}
                        isCurrentRound={isCurrentRound}
                        isDisabled={isArchived}
                        openProfitInputs={openProfitInputs}
                        onProfitAmountChange={handleProfitAmountChange}
                        onOpenProfit={handleOpenProfit}
                        onConfirmProfit={handleConfirmProfit}
                        onCancelProfit={handleCancelProfit}
                        onClearStatus={(legId) => handleClearStatus(legId, bottom?.leg?.id)}
                        onLoss={handleMarkLoss}
                        updateKey={updateKey}
                      />
                      <MatchSide
                        key={`bottom-${bottom?.leg?.id || idx}-${updateKey}`}
                        item={bottom}
                        isWinner={bottomIsWinner}
                        isLoser={bottom?.state.status === 'loss'}
                        isCurrentRound={isCurrentRound}
                        isDisabled={isArchived}
                        openProfitInputs={openProfitInputs}
                        onProfitAmountChange={handleProfitAmountChange}
                        onOpenProfit={handleOpenProfit}
                        onConfirmProfit={handleConfirmProfit}
                        onCancelProfit={handleCancelProfit}
                        onClearStatus={(legId) => handleClearStatus(legId, top?.leg?.id)}
                        onLoss={handleMarkLoss}
                        updateKey={updateKey}
                      />
                    </div>
                  )
                })}
              </div>
                </div>
              ))}

              {isArchived && tournament.winner && (
                <div className="champion-column">
                  <div className="round-header">
                    <h4>🏆 Champion</h4>
                    <span>Winner</span>
                  </div>
                  <div className="round-body">
                    <div className="champion-card" style={{ margin: 0 }}>
                      <div className="champion-emoji">{getTeamEmoji(tournament.winner.name)}</div>
                      <div className="champion-info">
                        <h3>
                          {tournament.winner.name}
                          <Crown className="w-5 h-5" style={{ color: 'var(--accent-warning)' }} />
                        </h3>
                          <p>{formatCurrency(tournament.winner.amount + (tournament.winner.profitAmount || 0))}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

      {/* All eliminated warning */}
      {allCurrentRoundComplete && !hasWinners && !isCompleted && (
        <div className="card">
          <div className="card-body text-center" style={{ padding: '40px 20px' }}>
            <div className="empty-state-icon" style={{ marginBottom: '20px' }}>
              <AlertCircle className="w-10 h-10" style={{ color: 'var(--accent-warning)' }} />
            </div>
            <h3 style={{ fontSize: '18px', marginBottom: '10px', color: 'var(--text-dark)' }}>No Winners This Round</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>All legs were eliminated. The tournament ends with no champion.</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
              <button onClick={handleReset} className="btn btn-primary">
                <RefreshCw className="w-4 h-4" />
                Reset Tournament
              </button>
              <Link to="/create">
                <button className="btn btn-white">
                  <Trophy className="w-4 h-4" />
                  New Tournament
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Eliminated Legs */}
      {tournament.legs.filter(l => l.eliminated).length > 0 && (
        <div className="eliminated-section">
          <div className="eliminated-header">Eliminated Legs</div>
          <div className="eliminated-list">
            {tournament.legs.filter(l => l.eliminated).map((leg) => (
              <div key={leg.id} className="eliminated-item">
                {leg.name}
                <span>R{leg.round}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

const MatchSide = ({
  item,
  isWinner,
  isLoser,
  isCurrentRound,
  isDisabled,
  openProfitInputs,
  onProfitAmountChange,
  onOpenProfit,
  onConfirmProfit,
  onCancelProfit,
  onClearStatus,
  onLoss,
  updateKey
}) => {
  const inputRef = useRef(null)
  const isInputOpen = item ? (item.leg.id in openProfitInputs) : false

  // Force focus when input becomes visible
  useEffect(() => {
    if (isInputOpen && inputRef.current) {
      // Multiple attempts to ensure focus works
      inputRef.current.focus()
      const timer1 = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus()
          inputRef.current.select()
        }
      }, 10)
      const timer2 = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus()
        }
      }, 100)
      return () => {
        clearTimeout(timer1)
        clearTimeout(timer2)
      }
    }
  }, [isInputOpen])

  if (!item) {
    return (
      <div className="competitor-empty">
        — Bye —
      </div>
    )
  }

  const { leg, state } = item
  const emoji = getTeamEmoji(leg.name)
  const profitAmount = openProfitInputs[leg.id] || ''
  const canAct = isCurrentRound && state.isCurrent && state.status === 'pending' && !isDisabled
  // Show reset button when leg has profit/loss status in current round (even if not "current" anymore)
  const canReset = isCurrentRound && state.status !== 'pending' && !isDisabled
  return (
    <div className={`competitor ${isWinner ? 'winner' : ''} ${isLoser ? 'loser' : ''}`}>
      <div className="competitor-emoji">{emoji}</div>
      <div className="competitor-main">
        <div className="competitor-name">
          {leg.name}
          {isWinner && <span className="badge badge-success">Win</span>}
          {isLoser && <span className="badge badge-danger">Out</span>}
          {canReset && (
            <button
              type="button"
              className="clear-status-btn"
              onClick={() => onClearStatus(leg.id)}
              title="Reset selection"
            >
              ↺
            </button>
          )}
        </div>
        <div className="competitor-meta">
          <span>{formatCurrency(state.amount)}</span>
          {state.status === 'profit' && state.profitAmount > 0 && (
            <span className="profit">+{formatCurrency(state.profitAmount)}</span>
          )}
        </div>

        {canAct && (
          <div className="competitor-actions">
            {isInputOpen ? (
              <div className="profit-input-row">
                <input
                  ref={inputRef}
                  type="text"
                  inputMode="decimal"
                  value={profitAmount}
                  onChange={(e) => onProfitAmountChange(leg.id, e.target.value)}
                  onFocus={(e) => e.target.select()}
                  onClick={(e) => {
                    window.focus()
                    e.target.focus()
                  }}
                  placeholder="Profit amount"
                  autoFocus
                  tabIndex={0}
                />
                <button
                  type="button"
                  className="btn btn-success btn-sm"
                  onClick={() => onConfirmProfit(leg.id)}
                  title="Confirm profit"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={() => onCancelProfit(leg.id)}
                  title="Cancel"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="action-buttons">
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={() => onLoss(leg.id)}
                >
                  Loss
                </button>
                <button
                  type="button"
                  className="btn btn-success btn-sm"
                  onClick={() => onOpenProfit(leg.id)}
                >
                  Profit
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Tournament
