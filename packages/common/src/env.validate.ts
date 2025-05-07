import { envSchema } from 'env-schema'

import { TEnv, type Env } from './env.schema.js'

const config = envSchema<Env>({ schema: TEnv })
export { config as env }
