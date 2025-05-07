import { MongoClient, Db, Document } from 'mongodb'

interface MongoOpts {
  dbName: string
  url: string
}

export abstract class MongoProvider {
  private __client: MongoClient
  private __db: Db | undefined
  private __dbName: string

  get db() {
    return this.__db
  }

  constructor(opts: MongoOpts) {
    this.__client = new MongoClient(opts.url, { maxPoolSize: 1000, minPoolSize: 100 })
    this.__dbName = opts.dbName
  }

  async connect() {
    await this.__client.connect()
    this.__db = this.__client.db(this.__dbName)
    await this.createIndexes()
  }

  async disconnect() {
    await this.__client.close()
  }

  getCollection<T extends Document>(name: string) {
    if (!this.__db) throw new Error('db not initialized')
    return this.__db.collection<T>(name)
  }

  abstract createIndexes(): Promise<void>
}
