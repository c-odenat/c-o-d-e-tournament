import { Routes, Route } from 'react-router-dom'
import { UserProvider, useUser } from './context/UserContext'
import { TournamentProvider } from './context/TournamentContext'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Tournament from './pages/Tournament'
import Analysis from './pages/Analysis'
import CreateTournament from './pages/CreateTournament'
import Login from './pages/Login'
import Register from './pages/Register'

function AppContent() {
  const { currentUser } = useUser()
  
  return (
    <TournamentProvider currentUserId={currentUser?.id}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={
          <ProtectedRoute>
            <Layout>
              <Home />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/create" element={
          <ProtectedRoute>
            <Layout>
              <CreateTournament />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/tournament/:id" element={
          <ProtectedRoute>
            <Layout>
              <Tournament />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/analysis" element={
          <ProtectedRoute>
            <Layout>
              <Analysis />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/analysis/:id" element={
          <ProtectedRoute>
            <Layout>
              <Analysis />
            </Layout>
          </ProtectedRoute>
        } />
      </Routes>
    </TournamentProvider>
  )
}

function App() {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  )
}

export default App
