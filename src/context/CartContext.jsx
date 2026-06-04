import { createContext, useContext, useReducer, useCallback } from 'react'

const CartContext = createContext(null)

// ─── Reducer ───
function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find(i => i.subcategory._id === action.payload.subcategory._id)
      if (existing) {
        return {
          ...state,
          items: state.items.map(i =>
            i.subcategory._id === action.payload.subcategory._id
              ? { ...i, quantity: i.quantity + 1 }
              : i
          ),
        }
      }
      return {
        ...state,
        items: [...state.items, { subcategory: action.payload.subcategory, quantity: 1, parentServiceName: action.payload.parentServiceName }],
      }
    }
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(i => i.subcategory._id !== action.payload),
      }
    case 'INCREMENT':
      return {
        ...state,
        items: state.items.map(i =>
          i.subcategory._id === action.payload
            ? { ...i, quantity: i.quantity + 1 }
            : i
        ),
      }
    case 'DECREMENT': {
      const item = state.items.find(i => i.subcategory._id === action.payload)
      if (item && item.quantity <= 1) {
        return {
          ...state,
          items: state.items.filter(i => i.subcategory._id !== action.payload),
        }
      }
      return {
        ...state,
        items: state.items.map(i =>
          i.subcategory._id === action.payload
            ? { ...i, quantity: i.quantity - 1 }
            : i
        ),
      }
    }
    case 'CLEAR_CART':
      return { ...state, items: [] }
    default:
      return state
  }
}

// ─── Provider ───
export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] })

  const addItem = useCallback((subcategory, parentServiceName = '') => {
    dispatch({ type: 'ADD_ITEM', payload: { subcategory, parentServiceName } })
  }, [])

  const removeItem = useCallback((subcategoryId) => {
    dispatch({ type: 'REMOVE_ITEM', payload: subcategoryId })
  }, [])

  const increment = useCallback((subcategoryId) => {
    dispatch({ type: 'INCREMENT', payload: subcategoryId })
  }, [])

  const decrement = useCallback((subcategoryId) => {
    dispatch({ type: 'DECREMENT', payload: subcategoryId })
  }, [])

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' })
  }, [])

  const totalItems = state.items.reduce((sum, i) => sum + i.quantity, 0)
  const totalPrice = state.items.reduce((sum, i) => sum + i.subcategory.price * i.quantity, 0)

  const getItemQuantity = useCallback((subcategoryId) => {
    const item = state.items.find(i => i.subcategory._id === subcategoryId)
    return item ? item.quantity : 0
  }, [state.items])

  const value = {
    cart: state.items,
    addItem,
    removeItem,
    increment,
    decrement,
    clearCart,
    totalItems,
    totalPrice,
    getItemQuantity,
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

export default CartContext
