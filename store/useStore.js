import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Cart Store
export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      
      addToCart: (product) => {
        const items = get().items
        const existingItem = items.find(
          item => item._id === product._id && 
                  item.size === product.size && 
                  item.color === product.color
        )
        
        if (existingItem) {
          set({
            items: items.map(item =>
              item._id === product._id && 
              item.size === product.size && 
              item.color === product.color
                ? { ...item, quantity: item.quantity + 1 }
                : item
            ),
          })
        } else {
          set({ items: [...items, { ...product, quantity: 1 }] })
        }
      },
      
      removeFromCart: (productId, size, color) => {
        set({
          items: get().items.filter(
            item => !(item._id === productId && item.size === size && item.color === color)
          ),
        })
      },
      
      updateQuantity: (productId, size, color, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(productId, size, color)
          return
        }
        set({
          items: get().items.map(item =>
            item._id === productId && item.size === size && item.color === color
              ? { ...item, quantity }
              : item
          ),
        })
      },
      
      clearCart: () => set({ items: [] }),
      
      getCartCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },
      
      getCartTotal: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0)
      },
    }),
    {
      name: 'vstra-cart',
    }
  )
)

// Auth Store
export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      
      login: (user, token) => {
        localStorage.setItem('token', token)
        set({ user, token, isAuthenticated: true })
      },
      
      logout: () => {
        localStorage.removeItem('token')
        set({ user: null, token: null, isAuthenticated: false })
      },
      
      updateUser: (user) => {
        set({ user })
      },
    }),
    {
      name: 'vstra-auth',
    }
  )
)
