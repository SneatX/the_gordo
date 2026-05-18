import type { ReservationStatus } from '@/types'

export type StatusFilter = ReservationStatus | 'all'

export const STATUS_LABEL: Record<ReservationStatus, string> = {
  active: 'Activa',
  cancelled: 'Cancelada',
  completed: 'Completada',
}

export const STATUS_STYLE: Record<ReservationStatus, string> = {
  active: 'bg-brand-yellow/30 border-brand-yellow-dark text-stone-dark',
  cancelled: 'bg-brand-red/10 border-brand-red text-brand-red',
  completed: 'bg-stone-dark/10 border-stone-dark/30 text-stone-mid',
}

export const EMPTY_FORM = {
  tableId: '',
  customerName: '',
  customerEmail: '',
  customerPhone: '',
  partySize: '2',
  date: '',
  time: '',
  durationMinutes: '90',
  status: 'active' as ReservationStatus,
}

export type ReservationForm = typeof EMPTY_FORM
