import { Response, Request, NextFunction } from 'express'
import { decodeJwt, errors, jwtVerify, SignJWT } from 'jose'

import { JWTPayload, TokenService } from '../types/token.js'

export interface JWTOpts {
  secret: string
  timespanInSec: number
  refreshTimeoutInSec: number
}

const alg = 'HS256'
export abstract class JWTMiddleware<T, V> implements TokenService<T> {
  private encoder = new TextEncoder()
  constructor(private __opts: JWTOpts) {}

  async authenticate(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization']
    if (!authHeader) {
      res.status(401).send({ error: 'no auth header supplied' })
      return
    }

    const [scheme, token] = authHeader.split(' ')
    if (scheme !== 'Bearer' || !token) {
      res.status(401).send({ error: 'invalid auth scheme' })
      return
    }

    const { user, newToken } = await this.verify(token)
    if (newToken) req.newToken = `Bearer ${newToken}`

    req['user'] = user
    next()
  }

  async sign(payload: { id: string }): Promise<string> {
    return new SignJWT(payload)
      .setProtectedHeader({ alg })
      .setIssuedAt()
      .setExpirationTime(Math.floor(Date.now() / 1000) + this.__opts.timespanInSec)
      .sign(this.encoder.encode(this.__opts.secret))
  }

  async verify(token: string, ignoreExp?: boolean): Promise<JWTPayload<T>> {
    try {
      const { payload } = await (async () => {
        if (ignoreExp) return decodeJwt(token)
        return jwtVerify(token, this.encoder.encode(this.__opts.secret))
      })()

      const { id, exp } = payload as { id: string; exp: number }
      const user = await this.getUser({ id })

      return { id, user, exp }
    } catch (err) {
      if (err instanceof errors.JWTExpired) return this.handleRefreshToken(token)
      throw err
    }
  }

  abstract getUser(payload: { id: string }): Promise<T>
  abstract getRefreshToken(payload: { id: string }): Promise<V>

  private async handleRefreshToken(token: string): Promise<JWTPayload<T>> {
    const { id, user } = await this.verify(token, true)

    const refreshToken: V = await this.getRefreshToken({ id })
    if (!refreshToken) throw new Error('no valid refresh token')

    const newToken = await this.sign({ id })
    return { id, user, newToken, exp: this.__opts.refreshTimeoutInSec }
  }
}
