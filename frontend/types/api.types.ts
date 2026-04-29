/**
 * types/api.types.ts — Generic API response shapes
 */

export interface ApiResponse<T = unknown> {
  data?:    T
  message?: string
  success:  boolean
}

export interface ApiError {
  detail:  string
  success: false
}

export interface PaginatedResponse<T> {
  items:    T[]
  total:    number
  page:     number
  per_page: number
  has_next: boolean
}

export type ApiStatus = 'idle' | 'loading' | 'success' | 'error'

export interface RequestState<T> {
  data:    T | null
  status:  ApiStatus
  error:   string | null
}
