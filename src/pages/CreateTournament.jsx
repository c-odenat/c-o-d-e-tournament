import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Trophy, 
  DollarSign, 
  Users, 
  Info,
  Target,
  Percent,
  Rocket
} from 'lucide-react'
import { useTournament } from '../context/TournamentContext'
import { formatCurrency } from '../utils/formatters'

const CreateTournament = () => {
  const navigate = useNavigate()
  const { createTournament } = useTournament()

  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [legs, setLegs] = useState(10)
  const [isCreating, setIsCreating] = useState(false)

  const legAmount = amount ? parseFloat(amount) / legs : 0

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim() || !amount || parseFloat(amount) <= 0) return

    setIsCreating(true)
    
    setTimeout(() => {
      const tournamentId = createTournament(name.trim(), parseFloat(amount), legs)
      navigate(`/tournament/${tournamentId}`)
    }, 500)
  }

  const presetAmounts = [1000, 3000, 5000, 10000]
  const presetLegs = [5, 8, 10, 12, 15]

  return (
    <div className="w-full">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Create New Tournament</h1>
        <p className="page-subtitle">Configure your trading competition parameters</p>
      </div>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-12 gap-6">
        {/* Left: Inputs */}
        <div className="lg:col-span-7 space-y-5">
          {/* Tournament Name */}
          <div className="form-section">
            <div className="form-section-header">
              <h4>Tournament Name</h4>
            </div>
            <div className="form-section-body">
              <div className="form-group">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., January Trading Battle"
                  required
                />
              </div>
            </div>
          </div>

          {/* Starting Amount */}
          <div className="form-section">
            <div className="form-section-header">
              <h4>Starting Capital</h4>
            </div>
            <div className="form-section-body">
              <div className="form-group">
                <label className="form-label">Amount (USD)</label>
                <div style={{ position: 'relative' }}>
                  <DollarSign 
                    className="w-5 h-5" 
                    style={{ 
                      position: 'absolute', 
                      left: '14px', 
                      top: '50%', 
                      transform: 'translateY(-50%)',
                      color: 'var(--text-muted)'
                    }} 
                  />
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="3000"
                    style={{ paddingLeft: '44px' }}
                    min="1"
                    step="any"
                    required
                  />
                </div>
                <div className="preset-buttons">
                  {presetAmounts.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setAmount(preset.toString())}
                      className={`preset-btn ${amount === preset.toString() ? 'active' : ''}`}
                    >
                      {formatCurrency(preset)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Number of Legs */}
          <div className="form-section">
            <div className="form-section-header">
              <h4>Number of Legs</h4>
            </div>
            <div className="form-section-body">
              <div className="form-group">
                <label className="form-label">Teams / Legs</label>
                <div style={{ position: 'relative' }}>
                  <Users 
                    className="w-5 h-5" 
                    style={{ 
                      position: 'absolute', 
                      left: '14px', 
                      top: '50%', 
                      transform: 'translateY(-50%)',
                      color: 'var(--text-muted)'
                    }} 
                  />
                  <input
                    type="number"
                    value={legs}
                    onChange={(e) => setLegs(Math.max(2, parseInt(e.target.value) || 2))}
                    style={{ paddingLeft: '44px' }}
                    min="2"
                    max="20"
                    required
                  />
                </div>
                <div className="preset-buttons">
                  {presetLegs.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setLegs(preset)}
                      className={`preset-btn ${legs === preset ? 'active' : ''}`}
                    >
                      {preset} Legs
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isCreating || !name.trim() || !amount}
            className="btn btn-primary btn-lg btn-block"
            style={{ 
              opacity: isCreating || !name.trim() || !amount ? 0.6 : 1,
              cursor: isCreating || !name.trim() || !amount ? 'not-allowed' : 'pointer'
            }}
          >
            {isCreating ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
                />
                Creating Tournament...
              </>
            ) : (
              <>
                <Rocket className="w-5 h-5" />
                Start Tournament
              </>
            )}
          </button>
        </div>

        {/* Right: Summary */}
        <div className="lg:col-span-5">
          <div className="space-y-5 lg:sticky lg:top-20">
            {/* Preview */}
            <div className="summary-panel">
              <div className="summary-header">
                <h4>Summary</h4>
                <span className="badge badge-info">
                  {amount ? 'Ready' : 'Enter values'}
                </span>
              </div>
              <div className="summary-body">
                <div className="summary-grid">
                  <div className="summary-item">
                    <div className="summary-item-label">
                      <DollarSign className="w-4 h-4" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                      Total Capital
                    </div>
                    <div className="summary-item-value">
                      {formatCurrency(parseFloat(amount) || 0)}
                    </div>
                  </div>
                  <div className="summary-item">
                    <div className="summary-item-label">
                      <Target className="w-4 h-4" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                      Per Leg
                    </div>
                    <div className="summary-item-value primary">
                      {formatCurrency(legAmount)}
                    </div>
                  </div>
                  <div className="summary-item">
                    <div className="summary-item-label">
                      <Users className="w-4 h-4" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                      Teams
                    </div>
                    <div className="summary-item-value">
                      {legs}
                    </div>
                  </div>
                  <div className="summary-item">
                    <div className="summary-item-label">
                      <Percent className="w-4 h-4" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                      Risk Per Leg
                    </div>
                    <div className="summary-item-value warning">
                      {(100 / legs).toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* How it works */}
            <div className="info-box">
              <h5>
                <Info className="w-4 h-4" />
                How It Works
              </h5>
              <ul>
                <li>Your capital is split equally among all legs (teams)</li>
                <li>Each leg represents one trade position</li>
                <li>Mark trades as profit or loss after each trade</li>
                <li>Profitable legs advance to the next round</li>
                <li>Tournament continues until one champion remains</li>
              </ul>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

export default CreateTournament
