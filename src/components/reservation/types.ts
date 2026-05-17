import type { RestaurantTable } from '@/types'

export type Step = 1 | 2 | 3 | 'success'

export interface StepIndicatorProps {
  current: Step
}

export interface SummaryBarProps {
  date: string
  time: string
  partySize: number
  tableNumber?: number
}

export interface LocationAccordionProps {
  locationName: string
  tables: RestaurantTable[]
  selectedTableId: string
  onSelect: (id: string) => void
}
