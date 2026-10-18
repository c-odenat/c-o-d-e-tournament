import { createContext, useContext, useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'

const UserContext = createContext()

export const useUser = () => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}

export const UserProvider = ({ children }) => {
  const [users, setUsers] = useState([])
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Load users and current session from localStorage
  useEffect(() => {
    const savedUsers = localStorage.getItem('tournament_users')
    const savedSession = localStorage.getItem('tournament_session')
    
    if (savedUsers) {
      const parsedUsers = JSON.parse(savedUsers)
      setUsers(parsedUsers)
      
      // Restore session if exists
      if (savedSession) {
        const sessionUserId = JSON.parse(savedSession)
        const user = parsedUsers.find(u => u.id === sessionUserId)
        if (user) {
          setCurrentUser(user)
        }
      }
    }
    setLoading(false)
  }, [])

  // Save users to localStorage
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('tournament_users', JSON.stringify(users))
    }
  }, [users, loading])

  // Save session to localStorage
  useEffect(() => {
    if (!loading) {
      if (currentUser) {
        localStorage.setItem('tournament_session', JSON.stringify(currentUser.id))
      } else {
        localStorage.removeItem('tournament_session')
      }
    }
  }, [currentUser, loading])

  const register = (username, password, displayName) => {
    // Check if username already exists
    if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
      return { success: false, error: 'Username already exists' }
    }

    if (username.length < 3) {
      return { success: false, error: 'Username must be at least 3 characters' }
    }

    if (password.length < 4) {
      return { success: false, error: 'Password must be at least 4 characters' }
    }

    const newUser = {
      id: uuidv4(),
      username: username.toLowerCase(),
      password, // In a real app, this should be hashed
      displayName: displayName || username,
      createdAt: new Date().toISOString(),
      avatar: getRandomAvatar()
    }

    setUsers(prev => [...prev, newUser])
    setCurrentUser(newUser)
    
    return { success: true, user: newUser }
  }

  const login = (username, password) => {
    const user = users.find(
      u => u.username.toLowerCase() === username.toLowerCase() && u.password === password
    )

    if (!user) {
      return { success: false, error: 'Invalid username or password' }
    }

    setCurrentUser(user)
    return { success: true, user }
  }

  const logout = () => {
    setCurrentUser(null)
  }

  const updateProfile = (updates) => {
    if (!currentUser) return { success: false, error: 'Not logged in' }

    const updatedUser = { ...currentUser, ...updates }
    setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u))
    setCurrentUser(updatedUser)
    
    return { success: true, user: updatedUser }
  }

  const deleteAccount = () => {
    if (!currentUser) return { success: false, error: 'Not logged in' }

    // Remove user's tournaments
    const savedTournaments = localStorage.getItem('tournaments')
    if (savedTournaments) {
      const tournaments = JSON.parse(savedTournaments)
      const filteredTournaments = tournaments.filter(t => t.userId !== currentUser.id)
      localStorage.setItem('tournaments', JSON.stringify(filteredTournaments))
    }

    // Remove user
    setUsers(prev => prev.filter(u => u.id !== currentUser.id))
    setCurrentUser(null)
    
    return { success: true }
  }

  const value = {
    users,
    currentUser,
    loading,
    register,
    login,
    logout,
    updateProfile,
    deleteAccount,
    isAuthenticated: !!currentUser
  }

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  )
}

// Helper to generate random avatar emoji
const getRandomAvatar = () => {
  const avatars = ['👤', '👨', '👩', '🧑', '👨‍💼', '👩‍💼', '🧑‍💻', '👨‍💻', '👩‍💻', '🦊', '🐯', '🦁', '🐻', '🐼', '🐨', '🐸', '🦉', '🦅', '🐺', '🦄']
  return avatars[Math.floor(Math.random() * avatars.length)]
}

export default UserContext
