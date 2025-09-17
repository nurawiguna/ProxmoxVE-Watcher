/**
 * Format bytes to human readable format
 * @param {number} bytes
 * @param {number} decimals
 * @returns {string}
 */
export const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes'
  if (bytes === null || bytes === undefined) return 'N/A'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

/**
 * Format percentage
 * @param {number} value
 * @param {number} total
 * @param {number} decimals
 * @returns {string}
 */
export const formatPercentage = (value, total, decimals = 1) => {
  if (total === 0 || !value || !total) return '0%'
  const percentage = (value / total) * 100
  return `${percentage.toFixed(decimals)}%`
}

/**
 * Format uptime duration
 * @param {number} seconds
 * @returns {string}
 */
export const formatUptime = (seconds) => {
  if (!seconds) return 'Unknown'

  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  const parts = []
  if (days > 0) parts.push(`${days}d`)
  if (hours > 0) parts.push(`${hours}h`)
  if (minutes > 0) parts.push(`${minutes}m`)

  return parts.length > 0 ? parts.join(' ') : '< 1m'
}

/**
 * Debounce function
 * @param {Function} func
 * @param {number} wait
 * @returns {Function}
 */
export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Get status color class
 * @param {string} status
 * @returns {string}
 */
export const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'running':
      return 'text-success-600 bg-success-50 border-success-200'
    case 'stopped':
      return 'text-danger-600 bg-danger-50 border-danger-200'
    case 'paused':
      return 'text-warning-600 bg-warning-50 border-warning-200'
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200'
  }
}

/**
 * Get VM type icon
 * @param {string} type
 * @returns {string}
 */
export const getVMTypeIcon = (type) => {
  switch (type?.toLowerCase()) {
    case 'qemu':
    case 'vm':
      return 'desktop'
    case 'lxc':
    case 'container':
      return 'cube'
    default:
      return 'question-mark-circle'
  }
}

/**
 * Capitalize first letter
 * @param {string} str
 * @returns {string}
 */
export const capitalize = (str) => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

/**
 * Format date to relative time
 * @param {Date|string} date
 * @returns {string}
 */
export const formatRelativeTime = (date) => {
  if (!date) return 'Never'
  
  const now = new Date()
  const target = new Date(date)
  const diffInSeconds = Math.floor((now - target) / 1000)

  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`
  
  return target.toLocaleDateString()
}

/**
 * Generate a unique ID
 * @returns {string}
 */
export const generateId = () => {
  return Math.random().toString(36).substring(2, 11)
}

/**
 * Sort array by multiple criteria
 * @param {Array} array
 * @param {Array} sortBy - Array of {key, order} objects
 * @returns {Array}
 */
export const multiSort = (array, sortBy) => {
  return [...array].sort((a, b) => {
    for (const { key, order = 'asc' } of sortBy) {
      const aVal = a[key]
      const bVal = b[key]
      
      if (aVal === bVal) continue
      
      const comparison = aVal < bVal ? -1 : 1
      return order === 'desc' ? -comparison : comparison
    }
    return 0
  })
}
