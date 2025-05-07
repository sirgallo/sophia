import cluster, { Worker } from 'cluster'
import compression from 'compression'
import express, { json } from 'express'
import helmet from 'helmet'
import { createServer, Server as HttpServer } from 'http'
import { cpus, hostname } from 'os'

import { logger, Logger } from 'common'
import { Route } from './route.js'
import { PollRoute } from './routes/poll.route.js'
import { ServerConfiguration } from './types/server.js'

export abstract class Server<T extends string> {
  protected app: ReturnType<typeof express> = express()
  protected logger: Logger = logger
  protected numOfCpus: number = cpus().length
  protected port: number
  protected version: string
  protected server?: HttpServer

  private __hostname = hostname()
  private __routes: Route<string, unknown>[] = [new PollRoute()]

  set routes(routes: Route<string, unknown>[]) {
    this.__routes = this.__routes.concat(routes)
  }

  constructor(opts: ServerConfiguration<T>) {
    this.port = opts.port
    this.version = opts.version
  }

  async startServer() {
    try {
      await this.initService()
      this.setupAndRun()
    } catch (err) {
      this.server?.removeAllListeners()
      logger.error((err as Error).message)
      process.exit(1)
    }
  }

  abstract initService(): Promise<boolean>
  abstract initListeners(): void

  private setupAndRun() {
    if (this.numOfCpus > 1 && cluster.isPrimary) {
      logger.info('...forking workers')
      this.setupWorkers()
    } else {
      this.initMiddleware()
      this.initRoutes()
      this.initListeners()
      this.listen()
    }
  }

  private initMiddleware() {
    this.app.use(compression())
    this.app.use(json())
    this.app.use(helmet())
  }

  private initRoutes() {
    for (const route of this.__routes) {
      this.app.use(route.rootPath, route.router)
      logger.info(`${route.rootPath} initiated`)
    }
  }

  private listen() {
    this.server = createServer(this.app)
    this.server.listen(this.port, () => {
      logger.info(`${this.__hostname} on process ${process.pid} listening on port ${this.port}...`)
    })
  }

  private setupWorkers() {
    const fork = () => {
      const worker = cluster.fork()
      worker.on('message', (message) => this.logger.debug(message))
    }

    for (let cpu = 0; cpu < this.numOfCpus; cpu++) {
      fork()
    }

    cluster.on('online', (worker) => this.logger.info(`worker ${worker.process.pid} is online.`))
    cluster.on('exit', (worker: Worker, code: number, signal: string) => {
      this.logger.error(`worker ${worker.process.pid} died with code ${code} and ${signal}.`)
      this.logger.warn('starting new worker...')
      fork()
    })
  }
}
