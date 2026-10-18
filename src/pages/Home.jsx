import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  PlusCircle, 
  Trophy, 
  TrendingUp, 
  TrendingDown,
  BarChart3,
  Zap,
  Play,
  Trash2,
  RefreshCw,
  Calendar,
  DollarSign,
  Target,
  ChevronRight
} from 'lucide-react'
import { useTournament } from '../context/TournamentContext'
import { formatCurrency, formatDate } from '../utils/formatters'

const Home = () => {
  const { tournaments, deleteTournament, resetTournament, getAllStats, loading } = useTournament()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-10 h-10 border-3 border-[var(--accent-primary)] border-t-transparent rounded-full"
        />
      </div>
    )
  }

  const stats = getAllStats()

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Manage your trading tournaments and track performance</p>
      </div>

      {/* Stats Grid - 4 columns for Home */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '20px' }}>
        <div className="stat-card">
          <div className="stat-icon primary">
            <Trophy className="w-5 h-5" />
          </div>
          <div className="stat-content">
            <h3>{stats.totalTournaments}</h3>
            <p>Tournaments</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon warning">
            <Zap className="w-5 h-5" />
          </div>
          <div className="stat-content">
            <h3>{stats.activeTournaments}</h3>
            <p>Active</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon info">
            <DollarSign className="w-5 h-5" />
          </div>
          <div className="stat-content">
            <h3>{formatCurrency(stats.totalInvested)}</h3>
            <p>Invested</p>
          </div>
        </div>

        <div className="stat-card">
          <div className={`stat-icon ${stats.netPnL >= 0 ? 'success' : 'danger'}`}>
            {stats.netPnL >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
          </div>
          <div className="stat-content">
            <h3 style={{ color: stats.netPnL >= 0 ? 'var(--accent-success)' : 'var(--accent-danger)' }}>
              {formatCurrency(stats.netPnL)}
            </h3>
            <p>Net P&L</p>
          </div>
        </div>
      </div>

      {/* Tournaments Section */}
      <div className="card">
        <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>Your Tournaments</span>
          {tournaments.length > 0 && (
            <Link to="/analysis" className="flex items-center gap-1" style={{ color: 'var(--accent-primary)', fontSize: '13px', fontWeight: 500 }}>
              View Analytics <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>
        <div className="card-body">
          {tournaments.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <Trophy className="w-10 h-10" style={{ color: 'var(--accent-primary)' }} />
              </div>
              <h3>No Tournaments Yet</h3>
              <p>Create your first tournament to start managing your trading risk like a pro.</p>
              <Link to="/create">
                <button className="btn btn-primary btn-lg">
                  <PlusCircle className="w-5 h-5" />
                  Create Tournament
                </button>
              </Link>
            </div>
          ) : (
            <div className="tournament-list">
              {tournaments.map((tournament, index) => (
                <TournamentRow
                  key={tournament.id}
                  tournament={tournament}
                  index={index}
                  onDelete={deleteTournament}
                  onReset={resetTournament}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const TournamentRow = ({ tournament, index, onDelete, onReset }) => {
  const activeLegs = tournament.legs.filter(l => !l.eliminated).length
  const completedLegs = tournament.legs.filter(l => l.status !== 'pending').length
  const progress = (completedLegs / tournament.numberOfLegs) * 100
  const isCompleted = tournament.status === 'completed'
  const isFinished = tournament.status === 'finished'
  const isArchived = isCompleted || isFinished

  return (
    <div className="tournament-row">
      {/* Icon */}
      <div className={`tournament-icon ${isArchived ? 'completed' : 'active'}`}>
        <Trophy />
      </div>

      {/* Info */}
      <div className="tournament-info">
        <h3>
          {tournament.name}
          {isCompleted && <span className="badge badge-success" style={{ marginLeft: '10px' }}>Completed</span>}
          {isFinished && (
            <span 
              className={`badge ${tournament.netPnL >= 0 ? 'badge-success' : 'badge-danger'}`} 
              style={{ marginLeft: '10px' }}
            >
              {tournament.netPnL >= 0 ? 'Profit' : 'Loss'}
            </span>
          )}
        </h3>
        <div className="tournament-meta">
          <span>
            <Calendar className="w-4 h-4" />
            {formatDate(tournament.createdAt)}
          </span>
          <span>
            <DollarSign className="w-4 h-4" />
            {formatCurrency(tournament.startingAmount)}
          </span>
          {isFinished && tournament.netPnL !== undefined ? (
            <span style={{ color: tournament.netPnL >= 0 ? 'var(--accent-success)' : 'var(--accent-danger)', fontWeight: 600 }}>
              <TrendingUp className="w-4 h-4" />
              {tournament.netPnL >= 0 ? '+' : ''}{formatCurrency(tournament.netPnL)}
            </span>
          ) : (
            <span>
              <Target className="w-4 h-4" />
              Round {tournament.currentRound}
            </span>
          )}
        </div>
      </div>

      {/* Progress */}
      <div className="tournament-progress">
        <div className="progress-label">
          <span>{activeLegs}/{tournament.numberOfLegs} legs</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="progress-bar">
          <div 
            className={`progress-fill ${isArchived ? 'complete' : ''}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="tournament-actions">
        <Link to={`/tournament/${tournament.id}`}>
          <button className={`btn ${isArchived ? 'btn-success' : 'btn-primary'}`}>
            <Play className="w-4 h-4" />
            {isArchived ? 'View' : 'Continue'}
          </button>
        </Link>
        
        <Link to={`/analysis/${tournament.id}`}>
          <button className="btn btn-ghost" title="Analytics">
            <BarChart3 className="w-4 h-4" />
          </button>
        </Link>

        <button
          onClick={() => onReset(tournament.id)}
          className="btn btn-ghost"
          title="Reset"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        <button
          onClick={() => onDelete(tournament.id)}
          className="btn btn-ghost"
          style={{ color: 'var(--accent-danger)' }}
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default Home
