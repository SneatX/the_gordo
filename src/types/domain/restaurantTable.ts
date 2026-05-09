export type TableStatus = 'active' | 'blocked'


export interface RestaurantTable {
    id: string
    number: number
    capacity: number
    locationId: string | null
    location?: Location
    status: TableStatus
    createdAt: Date
}