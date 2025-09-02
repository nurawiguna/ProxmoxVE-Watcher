import { ref, computed } from 'vue'

/**
 * Sorting composable
 * @param {Array} data - Array of items to sort
 * @param {string} defaultField - Default field to sort by
 * @param {string} defaultDirection - Default sort direction ('asc' or 'desc')
 */
export const useSorting = (data, defaultField = 'name', defaultDirection = 'asc') => {
  const sortField = ref(defaultField)
  const sortDirection = ref(defaultDirection)

  const sortedData = computed(() => {
    if (!data.value || data.value.length === 0) {
      return []
    }

    const sorted = [...data.value].sort((a, b) => {
      let valueA = a[sortField.value]
      let valueB = b[sortField.value]

      // Handle undefined/null values
      if (valueA === undefined || valueA === null) valueA = ''
      if (valueB === undefined || valueB === null) valueB = ''

      // Special handling for numeric fields
      if (sortField.value === 'uptime' || sortField.value === 'vmid') {
        // Convert to numbers for numeric comparison
        const numA = Number(valueA) || 0
        const numB = Number(valueB) || 0
        
        if (sortDirection.value === 'asc') {
          return numA - numB
        } else {
          return numB - numA
        }
      } else {
        // Convert to strings for consistent comparison
        valueA = String(valueA).toLowerCase()
        valueB = String(valueB).toLowerCase()

        if (sortDirection.value === 'asc') {
          return valueA.localeCompare(valueB)
        } else {
          return valueB.localeCompare(valueA)
        }
      }
    })

    return sorted
  })

  const toggleSort = (field) => {
    if (sortField.value === field) {
      // Toggle direction if same field
      sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
    } else {
      // Set new field with ascending direction
      sortField.value = field
      sortDirection.value = 'asc'
    }
  }

  const setSortField = (field) => {
    sortField.value = field
  }

  const setSortDirection = (direction) => {
    sortDirection.value = direction
  }

  const getSortIcon = (field) => {
    if (sortField.value !== field) {
      return 'bars-arrow-up' // Default/no sort icon
    }
    return sortDirection.value === 'asc' ? 'bars-arrow-up' : 'bars-arrow-down'
  }

  return {
    sortField,
    sortDirection,
    sortedData,
    toggleSort,
    setSortField,
    setSortDirection,
    getSortIcon,
  }
}
