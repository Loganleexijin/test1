declare namespace Express {
  interface Request {
    authToken?: string
    user?: {
      id: string
      email: string | null
    }
  }
}
