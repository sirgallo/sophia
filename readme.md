# sophia

## a strictly typed, no nonsense micro-framework for building express servers

`sophia` is a micro-framework for building services in express, which looks to blend both type safety for developer experience with performance.

It is highly recommended to use [tsyringe](https://github.com/microsoft/tsyringe) for dependency injection of routes and services.

### utilization

`route`

For each route you define, extend [Route](./packages/srv/src/route.ts). Route gives you a few utilities out of the box, like route validation and strictly typed sub routes.

Each route is treated as pipeline, where requests are processed in the following order, through `processRequest`:
  
  1. validate request --> ensure the request is properly formatted
  2. execute request --> pass the request off to your route service to processed

```ts
import { Request, Response, NextFunction } from 'express'
import { inject, injectable } from 'tsyringe'

import { Route } from 'srv'
import { TOKEN_MAP } from '../token.js'
import { routeMap } from '../route.map.js'
import { MyRouteEndpoints, MyRouteRequest } from '../types/myRoute.types.js'

@injectable()
export class MyRoute<T extends keyof MyRouteEndpoints, V extends MyRouteRequest<T>> extends Route<
  T,
  V
> {
  constructor(@inject(TOKEN_MAP.MyRouteEndpoints) private myRouteService: MyRouteEndpoints) {
    super({ rootPath: routeMap.myRoute.routePath })
    this.subPaths = [
      {
        path: routeMap.myRoute.subPaths.get.path,
        method: routeMap.myRoute.subPaths.get.method,
        handler: this.get,
      },
    ]
  }

  private async get(req: Request, res: Response, next: NextFunction) {
    const op = myRouteRouteMap.myRoute.subPaths.get.name as T
    await this.processRequest(op, req, res, next)
  }

  async validateRequest(operation: T, req: Request): Promise<V> {
    try {
      if (operation === 'get') {
        const potential: MyRouteRequest<'get'> = req.body
        if (this.validator.isEmptObject(potential)) throw new Error('empty req body')
        return potential as V
      }

      throw new Error('invalid operation provided')
    } catch (err) {
      throw err
    }
  }

  async executeRequest(
    operation: T,
    args: Awaited<V>,
    res: Response,
    next: NextFunction,
  ): Promise<boolean> {
    try {
      const resp = await this.myRouteService[operation](args as any)
      if (!resp) throw new Error('no resp body returned')
      res.status(200).send(resp)
      return true
    } catch (err) {
      throw new Error(`Error on ${MyRoute.name} => ${(err as Error).message}`)
    }
  }
}
```

`server`

When creating your service, import [Server](./packages/srv/src/server.ts). Server handles setting up all application level middleware, setting up base routes, and forking workers in the cluster for instance level load balancing.

```ts
import 'reflect-metadata'
import './di.js'

import { container } from 'tsyringe'
import { Server, ServerConfiguration } from 'srv'

import { ApplicableSystem } from './srv.confs.js'

import { MyRoute } from './routes/myRoute.route.js'

export class MyServer extends Server<ApplicableSystem> {
  constructor(opts: ServerConfiguration<ApplicableSystem>) {
    super(opts)
  }

  async initService(): Promise<boolean> {
    this.routes = [
      container.resolve(MyRoute)
    ]

    return true
  }

  initListeners = () => null
}
```

`types`

```ts
import { MyModel } from 'model'

export type MyRouteRequest<T extends keyof MyRouteEndpoints> = 
  [T] extends ['get']
  ? Pick<MyModel, 'modelId'>
  : never

export abstract class MyRouteEndpoints {
  abstract get: (opts: MyRouteRequest<'mySubRoute'>) => Promise<MyModel>
}

```

`routeMap`

```ts
import { RouteMap } from 'srv'

import { MyRouteEndpoints } from './types/myRoute.types.js'

export const routeMap: RouteMap<'myRoute', keyof MyRouteEndpoints> = {
  auth: {
    name: 'myRoute',
    routePath: '/myRoute',
    subPaths: {
      get: { name: 'get', path: '/', method: 'get' },
    },
  },
}
```

`di`

It is recommended to setup dependency injection registry in a separate file and import at the root level of the server. This allows for loose coupling of your application logic.

```ts
import { container } from 'tsyringe'

import { TOKEN_MAP } from './token.js'
import { MyRouteEndpoints } from './types/myRoute.types.js'
import { MyRouteService } from './services/myRoute.service.js' // define this yourself

container.registerSingleton<MyRouteEndpoints>(TOKEN_MAP.MyRouteEndpoints, MyRouteService)
```

`token`

Token is file that registers your dependencies and let's you resolve them later when injected.

```ts
export const TOKEN_MAP = {
  MyRouteEndpoints: Symbol('MyRouteEndpoints')
}
```

### run test server

`install`
```bash
pnpm install
```

before building server, also build common:
```bash
cd packages/common
pnpm build:common
```

`build and run`
```bash
cd packages/srv
pnpm build:srv
pnpm start:srv
```

### loadtest

[autocannon](https://github.com/mcollina/autocannon) is used for loadtesting.

`installation`
```bash
pnpm install -g autocannon
```

`run`
```bash
autocannon -c 500 -d 10 http://localhost:3000/poll
```

### note

`jwt middleware` is included but it is still under production at this time and includes refresh token strategy as well. This can be injected onto sub routes and acts as an auth guard on routes.