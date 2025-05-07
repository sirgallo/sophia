import { env } from 'common'
import { SystemMap } from './types/server.js'

export type ApplicableSystem = 'test'

export const serverConfigurations: SystemMap<ApplicableSystem> = {
  test: {
    root: '/test',
    port: 3000,
    name: 'test api',
    version: `${env.VERSION}`,
  },
}
