import redis, { FastifyRedisPlugin } from 'fastify-redis'
import fp from 'fastify-plugin'

import { createRedisClient } from '../redis'

type FastifyRedisPluginOptions = {
  redisNamespace: string
} & Partial<FastifyRedisPlugin>

export default fp<FastifyRedisPluginOptions>(async (fastify, opts) => {
  void fastify.register(redis, {
    client: createRedisClient(opts.redisNamespace),
    closeClient: true,
    ...opts
  })
})
