import { useParams, Link } from 'react-router-dom'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Trophy,
  Target,
  DollarSign,
  Calendar,
  Clock,
  Users,
  Percent,
  ChevronLeft,
  Home,
  Crown
} from 'lucide-react'
import { useTournament } from '../context/TournamentContext'
import { formatCurrency, formatPercentage, formatDateTime, formatDate } from '../utils/formatters'
import { getTeamEmoji } from '../utils/teamNames'

const Analysis = () => {
  const { id } = useParams()
  const { tournaments, getTournament, getTournamentStats, getAllStats } = useTournament()

  const tournament = id ? getTournament(id) : null
  const stats = tournament ? getTournamentStats(id) : null

  if (id && !tournament) {
    return (
      <div className="card">
        <div className="card-body text-center" style={{ padding: '60px 20px' }}>
          <div className="empty-state-icon" style={{ marginBottom: '20px' }}>
            <BarChart3 className="w-10 h-10" style={{ color: 'var(--text-muted)' }} />
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

  // Show overall analysis if no specific tournament
  if (!id) {
    return <OverallAnalysis tournaments={tournaments} globalStats={getAllStats()} />
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <Link to={`/tournament/${id}`}>
          <button className="btn btn-white">
            <ChevronLeft className="w-4 h-4" />
          </button>
        </Link>
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>{tournament.name}</h1>
          <p className="page-subtitle" style={{ margin: '5px 0 0' }}>Detailed performance breakdown</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon info">
            <DollarSign className="w-6 h-6" />
          </div>
          <div className="stat-content">
            <h3>{formatCurrency(tournament.startingAmount)}</h3>
            <p>Starting Capital</p>
          </div>
        </div>
        <div className="stat-card">
          <div className={`stat-icon ${stats.netPnL >= 0 ? 'success' : 'danger'}`}>
            {stats.netPnL >= 0 ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
          </div>
          <div className="stat-content">
            <h3 style={{ color: stats.netPnL >= 0 ? 'var(--accent-success)' : 'var(--accent-danger)' }}>
              {formatCurrency(stats.netPnL)}
            </h3>
            <p>Net P&L ({stats.roi}% ROI)</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon warning">
            <Target className="w-6 h-6" />
          </div>
          <div className="stat-content">
            <h3>{formatPercentage(stats.winRate)}</h3>
            <p>Win Rate</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple">
            <Trophy className="w-6 h-6" />
          </div>
          <div className="stat-content">
            <h3>Round {tournament.currentRound}</h3>
            <p>Current Round</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Tournament Details */}
        <div className="card">
          <div className="card-header">Tournament Details</div>
          <div className="card-body">
            <div className="table-wrapper">
              <table>
                <tbody>
                  <tr>
                    <td><Calendar className="w-4 h-4" style={{ display: 'inline', marginRight: '8px' }} />Created</td>
                    <td style={{ textAlign: 'right' }}>{formatDate(tournament.createdAt)}</td>
                  </tr>
                  {tournament.completedAt && (
                    <tr>
                      <td><Clock className="w-4 h-4" style={{ display: 'inline', marginRight: '8px' }} />Completed</td>
                      <td style={{ textAlign: 'right' }}>{formatDate(tournament.completedAt)}</td>
                    </tr>
                  )}
                  <tr>
                    <td><Users className="w-4 h-4" style={{ display: 'inline', marginRight: '8px' }} />Total Legs</td>
                    <td style={{ textAlign: 'right' }}>{tournament.numberOfLegs}</td>
                  </tr>
                  <tr>
                    <td><DollarSign className="w-4 h-4" style={{ display: 'inline', marginRight: '8px' }} />Per Leg Amount</td>
                    <td style={{ textAlign: 'right' }}>{formatCurrency(tournament.startingAmount / tournament.numberOfLegs)}</td>
                  </tr>
                  <tr>
                    <td><Percent className="w-4 h-4" style={{ display: 'inline', marginRight: '8px' }} />Risk Per Leg</td>
                    <td style={{ textAlign: 'right' }}>{(100 / tournament.numberOfLegs).toFixed(1)}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Leg Performance */}
        <div className="card">
          <div className="card-header">Leg Performance</div>
          <div className="card-body">
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'var(--accent-success)' }}></div>
                <span style={{ flex: 1, color: 'var(--text-body)' }}>Profitable</span>
                <strong style={{ color: 'var(--text-dark)' }}>{stats.profitableLegs}</strong>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'var(--accent-danger)' }}></div>
                <span style={{ flex: 1, color: 'var(--text-body)' }}>Eliminated</span>
                <strong style={{ color: 'var(--text-dark)' }}>{stats.eliminatedLegs}</strong>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'var(--text-muted)' }}></div>
                <span style={{ flex: 1, color: 'var(--text-body)' }}>Active/Pending</span>
                <strong style={{ color: 'var(--text-dark)' }}>{stats.activeLegs}</strong>
              </div>
            </div>
            <div className="progress-bar" style={{ height: '16px' }}>
              <div style={{ 
                display: 'flex', 
                height: '100%', 
                borderRadius: '4px', 
                overflow: 'hidden' 
              }}>
                <div style={{ 
                  width: `${(stats.profitableLegs / tournament.numberOfLegs) * 100}%`, 
                  background: 'var(--accent-success)' 
                }}></div>
                <div style={{ 
                  width: `${(stats.eliminatedLegs / tournament.numberOfLegs) * 100}%`, 
                  background: 'var(--accent-danger)' 
                }}></div>
                <div style={{ 
                  width: `${(stats.activeLegs / tournament.numberOfLegs) * 100}%`, 
                  background: 'var(--text-muted)' 
                }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Legs Table */}
      <div className="card">
        <div className="card-header">All Legs Performance</div>
        <div className="card-body">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Team</th>
                  <th>Status</th>
                  <th>Round</th>
                  <th style={{ textAlign: 'right' }}>Original</th>
                  <th style={{ textAlign: 'right' }}>Current</th>
                  <th style={{ textAlign: 'right' }}>Profit</th>
                </tr>
              </thead>
              <tbody>
                {tournament.legs.map((leg) => (
                  <tr key={leg.id} style={{ opacity: leg.eliminated ? 0.5 : 1 }}>
                    <td>
                      <span style={{ marginRight: '8px', fontSize: '18px' }}>{getTeamEmoji(leg.name)}</span>
                      {leg.name}
                    </td>
                    <td>
                      <span className={`badge ${
                        leg.status === 'profit' 
                          ? 'badge-success' 
                          : leg.status === 'loss' 
                            ? 'badge-danger'
                            : 'badge-info'
                      }`}>
                        {leg.status.charAt(0).toUpperCase() + leg.status.slice(1)}
                      </span>
                    </td>
                    <td>Round {leg.round}</td>
                    <td style={{ textAlign: 'right' }}>{formatCurrency(leg.originalAmount)}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatCurrency(leg.amount)}</td>
                    <td style={{ 
                      textAlign: 'right', 
                      fontWeight: 600,
                      color: leg.profitAmount > 0 ? 'var(--accent-success)' : 'var(--text-muted)'
                    }}>
                      {leg.profitAmount > 0 ? `+${formatCurrency(leg.profitAmount)}` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Winner Section */}
      {tournament.winner && (
        <div className="champion-card">
          <div className="champion-emoji">🏆</div>
          <div className="champion-info">
            <h3>
              <Crown className="w-5 h-5" style={{ color: 'var(--accent-warning)' }} />
              {tournament.winner.name} - Tournament Champion
            </h3>
            <p>Final Value: {formatCurrency(tournament.winner.amount + tournament.winner.profitAmount)}</p>
          </div>
        </div>
      )}
    </div>
  )
}

// Overall Analysis Component
const OverallAnalysis = ({ tournaments, globalStats }) => {
  const { getTournamentStats } = useTournament()

  if (tournaments.length === 0) {
    return (
      <div className="card">
        <div className="card-body text-center" style={{ padding: '60px 20px' }}>
          <div className="empty-state-icon" style={{ marginBottom: '20px' }}>
            <BarChart3 className="w-10 h-10" style={{ color: 'var(--text-muted)' }} />
          </div>
          <h3 style={{ fontSize: '20px', marginBottom: '10px', color: 'var(--text-dark)' }}>No Tournaments Yet</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>Create your first tournament to see analysis here.</p>
          <Link to="/create">
            <button className="btn btn-primary">
              <Trophy className="w-4 h-4" />
              Create Tournament
            </button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Overall Analysis</h1>
        <p className="page-subtitle">Performance across all tournaments</p>
      </div>

      {/* Global Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon primary">
            <Trophy className="w-6 h-6" />
          </div>
          <div className="stat-content">
            <h3>{globalStats.totalTournaments}</h3>
            <p>Total Tournaments</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon success">
            <Target className="w-6 h-6" />
          </div>
          <div className="stat-content">
            <h3>{globalStats.completedTournaments}</h3>
            <p>Completed</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon info">
            <DollarSign className="w-6 h-6" />
          </div>
          <div className="stat-content">
            <h3>{formatCurrency(globalStats.totalInvested)}</h3>
            <p>Total Invested</p>
          </div>
        </div>
        <div className="stat-card">
          <div className={`stat-icon ${globalStats.netPnL >= 0 ? 'success' : 'danger'}`}>
            {globalStats.netPnL >= 0 ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
          </div>
          <div className="stat-content">
            <h3 style={{ color: globalStats.netPnL >= 0 ? 'var(--accent-success)' : 'var(--accent-danger)' }}>
              {formatCurrency(globalStats.netPnL)}
            </h3>
            <p>Net P&L</p>
          </div>
        </div>
      </div>

      {/* Tournament List */}
      <div className="card">
        <div className="card-header">All Tournaments</div>
        <div className="card-body">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Tournament</th>
                  <th>Status</th>
                  <th>Legs</th>
                  <th style={{ textAlign: 'right' }}>Capital</th>
                  <th style={{ textAlign: 'right' }}>P&L</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tournaments.map((t) => {
                  const tStats = getTournamentStats(t.id)
                  return (
                    <tr key={t.id}>
                      <td>
                        <strong style={{ color: 'var(--text-dark)' }}>{t.name}</strong>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{formatDate(t.createdAt)}</div>
                      </td>
                      <td>
                        <span className={`badge ${t.status === 'completed' ? 'badge-success' : 'badge-info'}`}>
                          {t.status === 'completed' ? 'Completed' : 'Active'}
                        </span>
                      </td>
                      <td>{t.numberOfLegs}</td>
                      <td style={{ textAlign: 'right' }}>{formatCurrency(t.startingAmount)}</td>
                      <td style={{ 
                        textAlign: 'right', 
                        fontWeight: 600,
                        color: tStats.netPnL >= 0 ? 'var(--accent-success)' : 'var(--accent-danger)'
                      }}>
                        {tStats.netPnL >= 0 ? '+' : ''}{formatCurrency(tStats.netPnL)}
                      </td>
                      <td>
                        <Link to={`/analysis/${t.id}`}>
                          <button className="btn btn-primary btn-sm">
                            <BarChart3 className="w-4 h-4" />
                            Details
                          </button>
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Analysis
