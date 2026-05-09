import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LocationsPage from '@/pages/admin/LocationPage'
import RestaurantTablePage from '@/pages/admin/RestaurantTablePage'
import ReservationPage from '@/pages/admin/ReservationPage'
import SchedulePage from '@/pages/admin/SchedulePage'

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/admin/locations" replace />} />
        <Route path="/admin/locations" element={<LocationsPage />} />
        <Route path="/admin/tables" element={<RestaurantTablePage />} />
        <Route path="/admin/reservations" element={<ReservationPage />} />
        <Route path="/admin/schedules" element={<SchedulePage />} />
      </Routes>
    </BrowserRouter>
  )
}
