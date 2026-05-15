import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AdminLayout from '@/components/admin/AdminLayout'
import ProtectedRoute from '@/components/ProtectedRoute'
import LoginPage from '@/pages/LoginPage'
import LocationPage from '@/pages/admin/LocationPage'
import RestaurantTablePage from '@/pages/admin/RestaurantTablePage'
import ReservationPage from '@/pages/admin/ReservationPage'
import SchedulePage from '@/pages/admin/SchedulePage'

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Navigate to="/admin/reservations" replace />} />

        <Route
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/admin/reservations" element={<ReservationPage />} />
          <Route path="/admin/tables" element={<RestaurantTablePage />} />
          <Route path="/admin/schedules" element={<SchedulePage />} />
          <Route path="/admin/locations" element={<LocationPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
