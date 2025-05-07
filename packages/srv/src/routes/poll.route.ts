import { NextFunction, Request, Response } from 'express'

import { Route } from '../route.js'
import { routeMapping } from '../route.map.js'

export class PollRoute<T extends boolean> extends Route<'poll', T> {
  constructor() {
    super({ rootPath: routeMapping.poll.routePath })
    this.subPaths = [
      {
        path: routeMapping.poll.subPaths.root.path,
        method: routeMapping.poll.subPaths.root.method,
        handler: this.poll,
      },
    ]
  }

  private async poll(req: Request, res: Response, next: NextFunction) {
    await this.processRequest('poll', req, res, next)
  }

  async validateRequest(__operation: 'poll', __req: Request): Promise<T> {
    return true as T
  }

  async executeRequest(
    __operation: 'poll',
    __args: Awaited<T>,
    res: Response,
    __next: NextFunction,
  ) {
    res.status(200).send({ alive: true })
    return true
  }
}
