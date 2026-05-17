import type { ReactNode } from 'react'

export interface ModalProps {
  title: string
  onClose: () => void
  children: ReactNode
}

export interface SelectOption {
  value: string
  label: string
}

export interface CustomSelectProps {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  disabled?: boolean
}

export interface TooltipProps {
  text: string
  children: ReactNode
  side?: 'top' | 'bottom' | 'left' | 'right'
}

export interface DateInputProps {
  type?: 'date' | 'datetime-local'
  value: string
  onChange: (value: string) => void
  required?: boolean
  error?: boolean
  min?: string
  className?: string
}

export interface TablePaginationProps {
  total: number
  page: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  loading?: boolean
}

export interface TableSkeletonProps {
  cols: number
  rows?: number
}
