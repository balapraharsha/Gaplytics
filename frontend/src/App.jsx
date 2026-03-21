import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Landing from './pages/Landing'
import HRDashboard from './pages/hr/HRDashboard'
import RoleDetail from './pages/hr/RoleDetail'
import CompareView from './pages/hr/CompareView'
import CandidateUpload from './pages/candidate/CandidateUpload'
import Dashboard from './pages/candidate/Dashboard'
import DeadlineRoadmap from './pages/candidate/DeadlineRoadmap'
import MockInterview from './pages/candidate/MockInterview'
import InterviewResults from './pages/candidate/InterviewResults'
import AuthorizedInterview from './pages/candidate/AuthorizedInterview'
import LeafBackground from './components/LeafBackground'

export default function App() {
  return (
    <>
      <LeafBackground />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#162127',
            color: '#EDE0D0',
            border: '1px solid rgba(207,157,123,0.18)',
            fontFamily: '"Plus Jakarta Sans", sans-serif',
            fontSize: '13px',
            borderRadius: '10px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
          },
          success: {
            iconTheme: { primary: '#7A9E7E', secondary: '#162127' },
          },
          error: {
            iconTheme: { primary: '#9E4A3A', secondary: '#162127' },
          },
        }}
      />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/hr" element={<HRDashboard />} />
        <Route path="/hr/role/:role_id" element={<RoleDetail />} />
        <Route path="/hr/compare" element={<CompareView />} />
        <Route path="/candidate" element={<CandidateUpload />} />
        <Route path="/candidate/dashboard" element={<Dashboard />} />
        <Route path="/candidate/roadmap" element={<DeadlineRoadmap />} />
        <Route path="/candidate/interview" element={<AuthorizedInterview />} />
        <Route path="/candidate/results" element={<InterviewResults />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
