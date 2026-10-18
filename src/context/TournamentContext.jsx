import { createContext, useContext, useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { generateTeamName } from '../utils/teamNames'

const TournamentContext = createContext()

export const useTournament = () => {
  const context = useContext(TournamentContext)
  if (!context) {
    throw new Error('useTournament must be used within a TournamentProvider')
  }
  return context
}

const STORAGE_KEY = 'trading_tournaments'

export const TournamentProvider = ({ children, currentUserId }) => {
  const [allTournaments, setAllTournaments] = useState([])
  const [loading, setLoading] = useState(true)

  // Filter tournaments for current user
  const tournaments = currentUserId 
    ? allTournaments.filter(t => t.userId === currentUserId)
    : []

  // Load tournaments from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      setAllTournaments(JSON.parse(stored))
    }
    setLoading(false)
  }, [])

  // Save tournaments to localStorage whenever they change
  useEffect(() => {
    if (!loading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allTournaments))
    }
  }, [allTournaments, loading])

  // Create a new tournament
  const createTournament = (name, startingAmount, numberOfLegs = 10) => {
    if (!currentUserId) return null

    const legAmount = startingAmount / numberOfLegs
    const legs = Array.from({ length: numberOfLegs }, (_, index) => ({
      id: uuidv4(),
      name: generateTeamName(),
      amount: legAmount,
      originalAmount: legAmount,
      status: 'pending', // pending, loss, profit
      profitAmount: 0,
      round: 1,
      position: index,
      eliminated: false,
      history: []
    }))

    const tournament = {
      id: uuidv4(),
      userId: currentUserId,
      name,
      startingAmount,
      numberOfLegs,
      currentRound: 1,
      status: 'active', // active, completed
      legs,
      createdAt: new Date().toISOString(),
      completedAt: null,
      winner: null,
      totalProfit: 0,
      totalLoss: 0
    }

    setAllTournaments(prev => [...prev, tournament])
    return tournament.id
  }

  // Get a tournament by ID
  const getTournament = (id) => {
    return allTournaments.find(t => t.id === id && t.userId === currentUserId)
  }

  // Update a leg's status
  const updateLegStatus = (tournamentId, legId, status, profitAmount = 0) => {
    setAllTournaments(prev => prev.map(tournament => {
      if (tournament.id !== tournamentId) return tournament

      const updatedLegs = tournament.legs.map(leg => {
        if (leg.id !== legId) return leg

        const historyEntry = {
          round: tournament.currentRound,
          status,
          amount: leg.amount,
          profitAmount: status === 'profit' ? profitAmount : 0,
          timestamp: new Date().toISOString()
        }

        return {
          ...leg,
          status,
          profitAmount: status === 'profit' ? profitAmount : 0,
          eliminated: status === 'loss',
          history: [...leg.history, historyEntry]
        }
      })

      // Calculate totals
      const totalProfit = updatedLegs
        .filter(l => l.status === 'profit')
        .reduce((sum, l) => sum + l.profitAmount, 0)
      const totalLoss = updatedLegs
        .filter(l => l.status === 'loss')
        .reduce((sum, l) => sum + l.amount, 0)

      return {
        ...tournament,
        legs: updatedLegs,
        totalProfit,
        totalLoss
      }
    }))
  }

  // Clear a leg's status (reset to pending)
  const clearLegStatus = (tournamentId, legId) => {
    setAllTournaments(prev => prev.map(tournament => {
      if (tournament.id !== tournamentId) return tournament

      const updatedLegs = tournament.legs.map(leg => {
        if (leg.id !== legId) return leg
        if (leg.round !== tournament.currentRound) return leg

        return {
          ...leg,
          status: 'pending',
          profitAmount: 0,
          eliminated: false,
          history: leg.history.filter(h => h.round !== tournament.currentRound)
        }
      })

      // Recalculate totals
      const totalProfit = updatedLegs
        .filter(l => l.status === 'profit')
        .reduce((sum, l) => sum + l.profitAmount, 0)
      const totalLoss = updatedLegs
        .filter(l => l.status === 'loss')
        .reduce((sum, l) => sum + l.amount, 0)

      return {
        ...tournament,
        legs: updatedLegs,
        totalProfit,
        totalLoss
      }
    }))
  }

  // Advance to the next round
  const advanceToNextRound = (tournamentId) => {
    setAllTournaments(prev => prev.map(tournament => {
      if (tournament.id !== tournamentId) return tournament

      const activeLegs = tournament.legs.filter(
        l => !l.eliminated && l.status === 'profit'
      )

      // Maximum of 5 rounds
      const MAX_ROUNDS = 5

      // Check if tournament is completed (only one leg remaining, no profitable legs, or reached max rounds)
      if (activeLegs.length <= 1 || tournament.currentRound >= MAX_ROUNDS) {
        return {
          ...tournament,
          status: 'completed',
          completedAt: new Date().toISOString(),
          winner: activeLegs[0] || null
        }
      }

      // Advance profitable legs to next round
      const updatedLegs = tournament.legs.map(leg => {
        if (leg.eliminated || leg.status !== 'profit') return leg

        return {
          ...leg,
          amount: leg.amount + leg.profitAmount,
          profitAmount: 0,
          status: 'pending',
          round: tournament.currentRound + 1
        }
      })

      return {
        ...tournament,
        currentRound: tournament.currentRound + 1,
        legs: updatedLegs
      }
    }))
  }

  // Delete a tournament
  const deleteTournament = (id) => {
    setAllTournaments(prev => prev.filter(t => t.id !== id))
  }

  // Reset a tournament
  const resetTournament = (id) => {
    setAllTournaments(prev => prev.map(tournament => {
      if (tournament.id !== id) return tournament

      const legAmount = tournament.startingAmount / tournament.numberOfLegs
      const resetLegs = tournament.legs.map((leg, index) => ({
        ...leg,
        amount: legAmount,
        originalAmount: legAmount,
        status: 'pending',
        profitAmount: 0,
        round: 1,
        position: index,
        eliminated: false,
        history: []
      }))

      return {
        ...tournament,
        currentRound: 1,
        status: 'active',
        legs: resetLegs,
        completedAt: null,
        winner: null,
        totalProfit: 0,
        totalLoss: 0,
        finishedEarly: false
      }
    }))
  }

  // Finish tournament early (archive it)
  const finishTournament = (tournamentId) => {
    setAllTournaments(prev => prev.map(tournament => {
      if (tournament.id !== tournamentId) return tournament

      // Calculate final stats
      const activeLegs = tournament.legs.filter(l => !l.eliminated)
      const bestLeg = activeLegs.reduce((best, leg) => {
        const legValue = leg.amount + (leg.profitAmount || 0)
        const bestValue = best ? best.amount + (best.profitAmount || 0) : 0
        return legValue > bestValue ? leg : best
      }, null)

      // Calculate net P&L: (Final amounts remaining) - (Starting capital)
      const totalStartingCapital = tournament.startingAmount
      const finalRemainingAmount = activeLegs.reduce((sum, leg) => {
        return sum + leg.amount + (leg.profitAmount || 0)
      }, 0)
      
      const netPnL = finalRemainingAmount - totalStartingCapital
      const totalProfitEarned = netPnL > 0 ? netPnL : 0
      const totalCapitalLost = netPnL < 0 ? Math.abs(netPnL) : 0

      return {
        ...tournament,
        status: 'finished',
        completedAt: new Date().toISOString(),
        winner: bestLeg,
        totalProfit: totalProfitEarned,
        totalLoss: totalCapitalLost,
        netPnL,
        finishedEarly: true
      }
    }))
  }

  // Get statistics for a tournament
  const getTournamentStats = (tournamentId) => {
    const tournament = getTournament(tournamentId)
    if (!tournament) return null

    const activeLegs = tournament.legs.filter(l => !l.eliminated)
    const eliminatedLegs = tournament.legs.filter(l => l.eliminated)
    const profitableLegs = tournament.legs.filter(l => l.status === 'profit' && !l.eliminated)
    
    // Calculate net P&L: (Final amounts remaining) - (Starting capital)
    const totalStartingCapital = tournament.startingAmount
    const totalCurrentValue = activeLegs.reduce((sum, l) => sum + l.amount + l.profitAmount, 0)
    const netPnL = totalCurrentValue - totalStartingCapital
    
    const totalProfitAmount = netPnL > 0 ? netPnL : 0
    const totalLossAmount = netPnL < 0 ? Math.abs(netPnL) : 0

    const winRate = tournament.legs.length > 0
      ? ((profitableLegs.length / tournament.legs.filter(l => l.status !== 'pending').length) * 100) || 0
      : 0

    return {
      activeLegs: activeLegs.length,
      eliminatedLegs: eliminatedLegs.length,
      profitableLegs: profitableLegs.length,
      totalCurrentValue,
      totalProfitAmount,
      totalLossAmount,
      netPnL,
      winRate: winRate.toFixed(1),
      roi: (netPnL / tournament.startingAmount * 100).toFixed(2)
    }
  }

  // Get all tournaments statistics
  const getAllStats = () => {
    const totalTournaments = tournaments.length
    const activeTournaments = tournaments.filter(t => t.status === 'active').length
    const completedTournaments = tournaments.filter(t => t.status === 'completed' || t.status === 'finished').length
    
    const totalInvested = tournaments.reduce((sum, t) => sum + t.startingAmount, 0)
    
    // Calculate net P&L across all tournaments
    // Net P&L = Total profits earned - Total capital lost on losing legs
    let totalProfitEarned = 0
    let totalCapitalLost = 0
    
    tournaments.forEach(t => {
      t.legs.forEach(leg => {
        // Sum up all profits from history (all rounds)
        if (leg.history) {
          leg.history.forEach(h => {
            if (h.status === 'profit' && h.profitAmount > 0) {
              totalProfitEarned += h.profitAmount
            }
            if (h.status === 'loss') {
              totalCapitalLost += h.amount
            }
          })
        }
        // Also check current status if not in history yet
        if (leg.status === 'profit' && leg.profitAmount > 0 && (!leg.history || !leg.history.some(h => h.round === t.currentRound))) {
          totalProfitEarned += leg.profitAmount
        }
        if (leg.status === 'loss' && leg.eliminated && (!leg.history || !leg.history.some(h => h.round === t.currentRound))) {
          totalCapitalLost += leg.amount
        }
      })
    })

    return {
      totalTournaments,
      activeTournaments,
      completedTournaments,
      totalInvested,
      totalProfit: totalProfitEarned,
      totalLoss: totalCapitalLost,
      netPnL: totalProfitEarned - totalCapitalLost
    }
  }

  const value = {
    tournaments,
    loading,
    createTournament,
    getTournament,
    updateLegStatus,
    clearLegStatus,
    advanceToNextRound,
    deleteTournament,
    resetTournament,
    finishTournament,
    getTournamentStats,
    getAllStats
  }

  return (
    <TournamentContext.Provider value={value}>
      {children}
    </TournamentContext.Provider>
  )
}
