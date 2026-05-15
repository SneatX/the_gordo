import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AdminLayout from '@/components/admin/AdminLayout'
import ProtectedRoute from '@/components/ProtectedRoute'
import LoginPage from '@/pages/LoginPage'
import LocationPage from '@/pages/admin/LocationPage'
import RestaurantTablePage from '@/pages/admin/RestaurantTablePage'
import ReservationPage from '@/pages/admin/ReservationPage'
import SchedulePage from '@/pages/admin/SchedulePage'
import HomePage from '@/pages/public/HomePage'
import PublicReservationPage from '@/pages/public/ReservationPage'
import NotFoundPage from '@/pages/NotFoundPage'

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/reservar" element={<PublicReservationPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin" element={<Navigate to="/admin/reservations" replace />} />

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

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}
