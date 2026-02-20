import type { Response } from 'express'

export type ApiSuccess<T> = {
  success: true
  data: T
  message?: string
}

export type ApiFailure = {
  success: false
  message: string
  errorCode?: string
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure

export function sendOk<T>(res: Response, data: T, message?: string): void {
  const payload: ApiSuccess<T> = message ? { success: true, data, message } : { success: true, data }
  res.json(payload)
}

export function sendError(
  res: Response,
  status: number,
  message: string,
  errorCode?: string,
): void {
  const payload: ApiFailure = errorCode
    ? { success: false, message, errorCode }
    : { success: false, message }
  res.status(status).json(payload)
}
