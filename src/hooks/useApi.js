import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

export const useApi = () => {
  const { token, logout } = useAuth()
  const navigate = useNavigate()

  const fetchWithAuth = async (url, options = {}) => {
    try {
      const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
      }

      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(url, {
        ...options,
        headers,
      })

      // Si el token expiró o es inválido, cerrar sesión
      if (response.status === 401 || response.status === 403) {
        logout()
        navigate('/')
        throw new Error('Sesión expirada')
      }

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Error en la petición')
      }

      return { success: true, data }
    } catch (error) {
      console.error('API Error:', error)
      return { success: false, error: error.message }
    }
  }

  return { fetchWithAuth }
}
