import type { RestaurantTable } from "./restaurantTable"

export type ReservationStatus = 'active' | 'cancelled' | 'completed'

export interface Reservation {
    id: string
    tableId: string
    table?: RestaurantTable
    customerName: string
    customerPhone: string
    customerEmail: string
    startTime: Date
    durationMinutes: number
    endTime: Date           // derived: startTime + durationMinutes
    partySize: number
    status: ReservationStatus
    createdAt: Date
}