import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LocationsPage from '@/pages/admin/LocationPage'

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/admin/locations" replace />} />
        <Route path="/admin/locations" element={<LocationsPage />} />
      </Routes>
    </BrowserRouter>
  )
}
