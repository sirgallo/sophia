import { pino } from 'pino'

import { type Env } from './env.schema.js'
import { env } from './env.validate.js'

const envToLogger: { [env in Env['NODE_ENV']]: any } = {
  development: {
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
        colorize: true,
      },
    },
    level: 'debug',
  },
  production: true,
  test: false,
}

export const logger = pino(envToLogger[env.NODE_ENV])
export type Logger = typeof logger
