import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useComparisonStore = create(
  persist(
    (set, get) => ({
      items: [],

      addToComparison: (product) => {
        const items = get().items
        if (items.length >= 4) {
          return { success: false, message: 'Maximum 4 products can be compared' }
        }
        if (items.find(item => item._id === product._id)) {
          return { success: false, message: 'Product already in comparison' }
        }
        set({ items: [...items, product] })
        return { success: true, message: 'Added to comparison' }
      },

      removeFromComparison: (productId) => {
        set({ items: get().items.filter(item => item._id !== productId) })
      },

      clearComparison: () => {
        set({ items: [] })
      },

      getComparisonCount: () => {
        return get().items.length
      },

      isInComparison: (productId) => {
        return get().items.some(item => item._id === productId)
      },
    }),
    {
      name: 'comparison-storage',
    }
  )
)
