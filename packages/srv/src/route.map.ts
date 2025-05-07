import { RouteMap } from './types/route.js'

type PollRoute = 'poll'
type PollSubRoute = 'root'

export const routeMapping: RouteMap<PollRoute, PollSubRoute> = {
  poll: {
    name: 'poll',
    routePath: '/poll',
    subPaths: {
      root: { name: 'root', path: '/', method: 'get' },
    },
  },
}
