import { Static, Type } from '@sinclair/typebox'

const NodeEnv = {
  PORT: Type.Number({ default: 3000 }),
  NODE_ENV: Type.Union(
    [Type.Literal('production'), Type.Literal('development'), Type.Literal('test')],
    { default: 'development' },
  ),
  VERSION: Type.Number({ default: 0.1 }),
}

const TEnv = Type.Object({
  ...NodeEnv,
})

type Env = Static<typeof TEnv>

export { TEnv, type Env }
