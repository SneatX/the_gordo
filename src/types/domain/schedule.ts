export interface Schedule {
    id: string
    dayOfWeek: number       // 0=Sunday … 6=Saturday
    startTime: string       // "HH:mm"
    endTime: string         // "HH:mm"
    isActive: boolean
}