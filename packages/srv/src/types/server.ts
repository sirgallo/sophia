export interface ServerConfiguration<T extends string> {
  root: `/${T}`
  name: `${T} api`
  port: number
  version: string
}

export type SystemMap<T extends string> = { [s in T]: ServerConfiguration<s> }
