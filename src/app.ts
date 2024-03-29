import { FastifyPluginAsync } from 'fastify'
import AutoLoad, { AutoloadPluginOptions } from 'fastify-autoload'
import { join } from 'path'

import { Config } from './config'

export type AppOptions = Config & Partial<AutoloadPluginOptions>

const app: FastifyPluginAsync<AppOptions> = async (
  fastify,
  opts
): Promise<void> => {
  void fastify.register(AutoLoad, {
    dir: join(__dirname, 'plugins'),
    options: opts
  })

  void fastify.register(AutoLoad, {
    dir: join(__dirname, 'routes'),
    options: opts
  })
}

export default app
export { app }
