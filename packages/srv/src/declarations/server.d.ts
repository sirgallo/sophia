import 'express'

declare module 'express' {
  export interface Request {
    user?: any
    newToken?: string
  }
}
