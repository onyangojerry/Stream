import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Home from './pages/Home'
import VideoCall from './pages/VideoCall'
import Webinar from './pages/Webinar'
import GroupCall from './pages/GroupCall'
import Scheduler from './pages/Scheduler'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
        {/* Public Routes */}
        <Route path="/login" element={
          <ProtectedRoute requireAuth={false}>
            <Login />
          </ProtectedRoute>
        } />
        <Route path="/signup" element={
          <ProtectedRoute requireAuth={false}>
            <Signup />
          </ProtectedRoute>
        } />
        
        {/* Protected Routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <Layout>
              <Home />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/call/:roomId" element={
          <ProtectedRoute>
            <Layout>
              <VideoCall />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/webinar/:roomId" element={
          <ProtectedRoute>
            <Layout>
              <Webinar />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/group/:roomId" element={
          <ProtectedRoute>
            <Layout>
              <GroupCall />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/scheduler" element={
          <ProtectedRoute>
            <Layout>
              <Scheduler />
            </Layout>
          </ProtectedRoute>
        } />
        </Routes>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
      </div>
    </Router>
  )
}

export default App
