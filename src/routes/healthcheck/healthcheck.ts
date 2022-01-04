import { FastifyPluginAsync } from 'fastify'

const healthcheck: FastifyPluginAsync = async (
  fastify,
  _opts
): Promise<void> => {
  fastify.get('/healthcheck', async (_request, _reply) => {
    let redisStatus = 'down'
    try {
      redisStatus = fastify.redis.status
    } catch (err: unknown) {
      // swallow error
      fastify.log.debug(
        { err },
        'failed to read redis status during health check'
      )
    }

    return {
      serverTimestamp: new Date(),
      status: 'ok',
      redisStatus
    }
  })
}

export default healthcheck
