import IoRedis from 'ioredis'

import { config } from './config'

export function createRedisClient(namespace: string): IoRedis.Redis {
  return new IoRedis(config.redisPort, config.redisHost, {
    keyPrefix: namespace
  })
}
