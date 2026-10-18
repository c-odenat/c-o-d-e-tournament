export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

export const formatNumber = (number, decimals = 2) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(number)
}

export const formatPercentage = (value, decimals = 1) => {
  return `${formatNumber(value, decimals)}%`
}

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export const formatDateTime = (dateString) => {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const getStatusColor = (status) => {
  switch (status) {
    case 'profit':
      return 'text-emerald-400'
    case 'loss':
      return 'text-red-400'
    case 'pending':
    default:
      return 'text-slate-400'
  }
}

export const getStatusBgColor = (status) => {
  switch (status) {
    case 'profit':
      return 'bg-emerald-500/20 border-emerald-500/30'
    case 'loss':
      return 'bg-red-500/20 border-red-500/30'
    case 'pending':
    default:
      return 'bg-slate-500/20 border-slate-500/30'
  }
}
