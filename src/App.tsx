import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { lazy, Suspense } from 'react'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'

// Lazy load all pages for faster initial load
const Home = lazy(() => import('./pages/Home'))
const VideoCall = lazy(() => import('./pages/VideoCall'))
const Webinar = lazy(() => import('./pages/Webinar'))
const GroupCall = lazy(() => import('./pages/GroupCall'))
const Scheduler = lazy(() => import('./pages/Scheduler'))
const Login = lazy(() => import('./pages/Login'))
const Signup = lazy(() => import('./pages/Signup'))

// Loading component for lazy-loaded pages
const PageLoader = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
    <div className="flex flex-col items-center space-y-4">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-gray-600 dark:text-gray-400">Loading...</p>
    </div>
  </div>
)

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Suspense fallback={<PageLoader />}>
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
        </Suspense>
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
