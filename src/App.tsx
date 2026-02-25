import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { lazy, Suspense, useEffect } from 'react'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import { useAuthStore } from './store/useAuthStore'

// Lazy load all pages for faster initial load
const Home = lazy(() => import('./pages/Home-improved'))
const VideoCall = lazy(() => import('./pages/VideoCall'))
const JoinMeeting = lazy(() => import('./pages/JoinMeeting'))
const Webinar = lazy(() => import('./pages/Webinar'))
const GroupCall = lazy(() => import('./pages/GroupCall'))
const Scheduler = lazy(() => import('./pages/Scheduler'))
const Login = lazy(() => import('./pages/Login'))
const Signup = lazy(() => import('./pages/Signup'))
const Profile = lazy(() => import('./pages/Profile'))
const Community = lazy(() => import('./pages/Community'))
const RecordingTestPage = lazy(() => import('./pages/RecordingTestPage'))
const TranscriptionTest = lazy(() => import('./pages/TranscriptionTest'))
const ViewRecordings = lazy(() => import('./pages/ViewRecordings-store'))

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
  const initializeAuth = useAuthStore(state => state.initializeAuth)

  useEffect(() => {
    // Initialize Supabase auth session on app load
    initializeAuth()
  }, [initializeAuth])

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
          
          {/* Public Home Route - accessible to everyone */}
          <Route path="/" element={
            <Layout>
              <Home />
            </Layout>
          } />
          
          {/* Public Routes */}
          <Route path="/join" element={
            <Layout>
              <JoinMeeting />
            </Layout>
          } />
          <Route path="/community" element={
            <Layout>
              <Community />
            </Layout>
          } />
          <Route path="/call/:roomId" element={
            <Layout>
              <VideoCall />
            </Layout>
          } />
          
          {/* Protected Routes */}
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
          <Route path="/recordings" element={
            <ProtectedRoute>
              <Layout>
                <ViewRecordings onBack={() => window.history.back()} />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Layout>
                <Profile />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/test-recording" element={
            <RecordingTestPage />
          } />
          <Route path="/test-transcription" element={
            <TranscriptionTest />
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
