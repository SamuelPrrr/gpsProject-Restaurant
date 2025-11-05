export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

export const API_ENDPOINTS = {
  auth: {
    login: `${API_URL}/auth/login`,
  },
  users: `${API_URL}/users`,
  products: `${API_URL}/products`,
  orders: `${API_URL}/orders`,
  accounts: `${API_URL}/accounts`,
  kitchen: `${API_URL}/kitchen`,
  tickets: `${API_URL}/tickets`,
}
