import { Server } from './server.js'
import { ServerConfiguration } from './types/server.js'
import { ApplicableSystem } from './srv.confs.js'

export class TestServer extends Server<ApplicableSystem> {
  constructor(opts: ServerConfiguration<ApplicableSystem>) {
    super(opts)
  }

  async initService(): Promise<boolean> {
    return true
  }

  initListeners = () => null
}
