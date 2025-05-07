import { logger } from 'common'

import { TestServer } from './test.js'
import { serverConfigurations } from './srv.confs.js'

try {
  const server = new TestServer(serverConfigurations.test)
  await server.startServer()
} catch (err) {
  logger.error(err)
  process.exit(1)
}
