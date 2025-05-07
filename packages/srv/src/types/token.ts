import { Request, Response, NextFunction } from 'express'

export interface JWTPayload<T> {
  id: string
  user: T
  exp: number
  newToken?: string
}

export interface TokenService<T> {
  authenticate: (req: Request, res: Response, next: NextFunction) => Promise<void>
  sign: (payload: { id: string }) => Promise<string>
  verify: (token: string) => Promise<JWTPayload<T>>
}
