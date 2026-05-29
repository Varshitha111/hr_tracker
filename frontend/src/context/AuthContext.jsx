import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('sims_token')
    const userData = localStorage.getItem('sims_user')
    if (token && userData) {
      setUser(JSON.parse(userData))
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    const { token, name, email: userEmail } = res.data
    localStorage.setItem('sims_token', token)
    localStorage.setItem('sims_user', JSON.stringify({ name, email: userEmail }))
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    setUser({ name, email: userEmail })
    return res.data
  }

  const logout = () => {
    localStorage.removeItem('sims_token')
    localStorage.removeItem('sims_user')
    delete api.defaults.headers.common['Authorization']
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
