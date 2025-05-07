import { NextFunction, Request, Response, Router } from 'express'

import { RouteOpts, RoutePathOpts } from './types/route.js'
import { RouteRequestValidators } from './validator.js'

export abstract class Route<T extends string, V> {
  protected validator = RouteRequestValidators
  private __router: ReturnType<typeof Router> = Router()
  private __rootPath: string
  private __subPaths: RoutePathOpts[] = []

  get router(): ReturnType<typeof Router> {
    return this.__router
  }

  get rootPath() {
    return this.__rootPath
  }

  set subPaths(opts: RoutePathOpts[]) {
    this.__subPaths.push(...opts)
    this.__register()
  }

  constructor(opts: RouteOpts) {
    this.__rootPath = opts.rootPath
  }

  protected async processRequest(
    operation: T,
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<boolean> {
    try {
      const validatedArgs = await this.validateRequest(operation, req)
      if (!validatedArgs) throw new Error('invalid request arguments from client')
      if (req.newToken) res.setHeader('x-refresh-token', req.newToken)

      return this.executeRequest(operation, validatedArgs, res, next)
    } catch (err) {
      res.status(404).send({ err: (err as Error).message })
      return false
    }
  }

  private __register() {
    for (const { path, method, middleware, handler } of this.__subPaths) {
      this.__router[method](path, ...(middleware ?? []), handler.bind(this))
    }
  }

  abstract validateRequest(operation: T, req: Request): Promise<V>
  abstract executeRequest(
    operation: T,
    args: Awaited<ReturnType<typeof this.validateRequest>>,
    res: Response,
    next: NextFunction,
  ): Promise<boolean>
}
