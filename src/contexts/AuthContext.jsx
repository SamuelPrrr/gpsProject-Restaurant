import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)

  const login = async (email, password) => {
    // Implementación temporal - aquí integrarás tu API real
    return new Promise((resolve) => {
      setTimeout(() => {
        if (email && password) {
          const userData = { email, name: 'Usuario' }
          setUser(userData)
          resolve({ success: true, user: userData })
        } else {
          resolve({ success: false, message: 'Credenciales inválidas' })
        }
      }, 500)
    })
  }

  const logout = () => {
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }
  return context
}
