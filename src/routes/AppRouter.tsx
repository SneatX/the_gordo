import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LocationsPage from '@/pages/admin/LocationPage'
import RestaurantTablePage from '@/pages/admin/RestaurantTablePage'
import ReservationPage from '@/pages/admin/ReservationPage'
import SchedulePage from '@/pages/admin/SchedulePage'
import LoginPage from '@/pages/LoginPage'
import ProtectedRoute from '@/components/ProtectedRoute'

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Navigate to="/admin/locations" replace />} />
        <Route
          path="/admin/locations"
          element={<ProtectedRoute><LocationsPage /></ProtectedRoute>}
        />
        <Route
          path="/admin/tables"
          element={<ProtectedRoute><RestaurantTablePage /></ProtectedRoute>}
        />
        <Route
          path="/admin/reservations"
          element={<ProtectedRoute><ReservationPage /></ProtectedRoute>}
        />
        <Route
          path="/admin/schedules"
          element={<ProtectedRoute><SchedulePage /></ProtectedRoute>}
        />
      </Routes>
    </BrowserRouter>
  )
}
