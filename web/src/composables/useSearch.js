import { ref, computed } from 'vue'
import { debounce } from '@/utils/formatters'

/**
 * Search functionality composable
 * @param {Array} items - Items to search through
 * @param {Array} searchFields - Fields to search in
 * @param {number} debounceMs - Debounce delay in milliseconds
 */
export const useSearch = (items, searchFields = ['name'], debounceMs = 300) => {
  const searchQuery = ref('')
  const isSearching = ref(false)

  // Debounced search function
  const performSearch = debounce((query) => {
    isSearching.value = false
  }, debounceMs)

  // Watch for search query changes
  const setSearchQuery = (query) => {
    searchQuery.value = query
    if (query) {
      isSearching.value = true
      performSearch(query)
    } else {
      isSearching.value = false
    }
  }

  // Filtered results
  const filteredItems = computed(() => {
    if (!searchQuery.value.trim()) {
      return items.value || []
    }

    const query = searchQuery.value.toLowerCase()
    
    return (items.value || []).filter(item => {
      return searchFields.some(field => {
        const value = item[field]
        if (value === null || value === undefined) return false
        return value.toString().toLowerCase().includes(query)
      })
    })
  })

  const clearSearch = () => {
    searchQuery.value = ''
    isSearching.value = false
  }

  return {
    searchQuery,
    isSearching,
    filteredItems,
    setSearchQuery,
    clearSearch,
  }
}
