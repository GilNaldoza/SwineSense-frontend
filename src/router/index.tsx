import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from '../layout'
import App from '../App'
import Dashboard from '../pages/dashboard'
import ScanHistoryPage from '../pages/scanHistory'
import PigProfile from '../pages/pigProfile'
import PigManagementPage from '../pages/pigManagementNew'
import AnalyticsPage from '../pages/analyticsPage'
import StaffManagementPage from '../pages/staffPage'
import SettingsPage from '../pages/settingsPage'
import SignIn from '@/pages/signin'
import AuditPage from '@/pages/auditPage'
import NotFound from '@/pages/notFound'
import TreatmentsPage from '@/pages/treatmentsPage'
import ReportsPage from '@/pages/reportsPage'

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<App />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="records" element={<ScanHistoryPage />} />
          <Route path="pig/:id" element={<PigProfile />} />
          <Route path="pig-management" element={<PigManagementPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="treatments" element={<TreatmentsPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="staff" element={<StaffManagementPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="sign-in" element={<SignIn />} />
          <Route path="audit" element={<AuditPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
