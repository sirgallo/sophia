import { Request, Response, NextFunction } from 'express'

type Method = 'delete' | 'get' | 'post' | 'put'

type Handler = (req: Request, res: Response, next: NextFunction) => Promise<void>

export interface RoutePathOpts {
  path: string
  method: Method
  handler: Handler
  middleware?: Handler[]
}

export interface RouteOpts {
  rootPath: string
}

type BaseRoute<T extends string, V extends string | undefined> = [V] extends [undefined]
  ? {
      name: T
      routePath: `/${T}` | '/'
    }
  : [V] extends [string]
    ? {
        name: T
        routePath: `/${T}` | '/'
        subPaths: SubRouteMap<V>
      }
    : never

interface SubRoute<T extends string> {
  name: T
  path: `/${string}` | '/'
  method: Method
}

type SubRouteMap<T extends string> = {
  [subRoute in T]: SubRoute<subRoute>
}

export type RouteMap<T extends string, V extends string | undefined = undefined> = {
  [route in T]: BaseRoute<route, V>
}
