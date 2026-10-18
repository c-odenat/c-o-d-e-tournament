// Team name generator with trading/battle theme
const adjectives = [
  'Alpha', 'Beta', 'Gamma', 'Delta', 'Omega',
  'Golden', 'Silver', 'Bronze', 'Diamond', 'Platinum',
  'Rising', 'Falling', 'Soaring', 'Thunder', 'Lightning',
  'Swift', 'Mighty', 'Fierce', 'Bold', 'Noble',
  'Royal', 'Imperial', 'Crimson', 'Azure', 'Emerald',
  'Shadow', 'Storm', 'Fire', 'Ice', 'Wind',
  'Brave', 'Elite', 'Prime', 'Ultra', 'Mega',
  'Phantom', 'Cosmic', 'Stellar', 'Solar', 'Lunar'
]

const nouns = [
  'Bulls', 'Bears', 'Hawks', 'Eagles', 'Wolves',
  'Lions', 'Tigers', 'Panthers', 'Dragons', 'Phoenix',
  'Titans', 'Legends', 'Warriors', 'Knights', 'Gladiators',
  'Traders', 'Moguls', 'Tycoons', 'Barons', 'Magnates',
  'Sharks', 'Whales', 'Falcons', 'Vipers', 'Cobras',
  'Spartans', 'Vikings', 'Samurai', 'Ninjas', 'Ronin',
  'Aces', 'Kings', 'Queens', 'Jokers', 'Royals',
  'Raiders', 'Rangers', 'Riders', 'Hunters', 'Seekers'
]

const usedNames = new Set()

export const generateTeamName = () => {
  let name = ''
  let attempts = 0
  const maxAttempts = 100

  do {
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)]
    const noun = nouns[Math.floor(Math.random() * nouns.length)]
    name = `${adjective} ${noun}`
    attempts++
  } while (usedNames.has(name) && attempts < maxAttempts)

  usedNames.add(name)
  return name
}

export const resetUsedNames = () => {
  usedNames.clear()
}

// Emoji mappings for team names
export const getTeamEmoji = (name) => {
  const lowerName = name.toLowerCase()
  
  if (lowerName.includes('bull')) return '🐂'
  if (lowerName.includes('bear')) return '🐻'
  if (lowerName.includes('hawk') || lowerName.includes('eagle') || lowerName.includes('falcon')) return '🦅'
  if (lowerName.includes('wolf') || lowerName.includes('wolves')) return '🐺'
  if (lowerName.includes('lion')) return '🦁'
  if (lowerName.includes('tiger')) return '🐯'
  if (lowerName.includes('panther')) return '🐆'
  if (lowerName.includes('dragon')) return '🐉'
  if (lowerName.includes('phoenix')) return '🔥'
  if (lowerName.includes('shark')) return '🦈'
  if (lowerName.includes('whale')) return '🐋'
  if (lowerName.includes('viper') || lowerName.includes('cobra')) return '🐍'
  if (lowerName.includes('golden') || lowerName.includes('gold')) return '🏆'
  if (lowerName.includes('silver')) return '🥈'
  if (lowerName.includes('diamond')) return '💎'
  if (lowerName.includes('platinum')) return '⭐'
  if (lowerName.includes('thunder') || lowerName.includes('lightning') || lowerName.includes('storm')) return '⚡'
  if (lowerName.includes('fire')) return '🔥'
  if (lowerName.includes('ice')) return '❄️'
  if (lowerName.includes('shadow') || lowerName.includes('phantom')) return '👻'
  if (lowerName.includes('cosmic') || lowerName.includes('stellar') || lowerName.includes('solar') || lowerName.includes('lunar')) return '🌟'
  if (lowerName.includes('king') || lowerName.includes('royal') || lowerName.includes('imperial')) return '👑'
  if (lowerName.includes('queen')) return '👸'
  if (lowerName.includes('knight') || lowerName.includes('gladiator') || lowerName.includes('warrior')) return '⚔️'
  if (lowerName.includes('ninja') || lowerName.includes('samurai') || lowerName.includes('ronin')) return '🥷'
  if (lowerName.includes('viking')) return '🪓'
  
  return '🎯'
}
