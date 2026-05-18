import type { TableStatus } from '@/types'

export type StatusFilter = TableStatus | 'all'

export const STATUS_LABEL: Record<TableStatus, string> = {
  active: 'Activa',
  blocked: 'Bloqueada',
}

export const EMPTY_FORM = {
  number: '',
  capacity: '',
  locationId: '',
  status: 'active' as TableStatus,
}

export type TableForm = typeof EMPTY_FORM
