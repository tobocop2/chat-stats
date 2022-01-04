import { FastifyPluginAsync } from 'fastify'

import {
  ROOMS_KEY,
  NICKS_KEY,
  WORDS_KEY,
  FAILED_MESSAGES_KEY
} from '../../constants'
import { buildMessagesPerSecondKey, secondsSinceEpoch } from '../../utils'

import { MessagesPerSecond } from '../../types'

// @todo add explicit schemas for endpoints and make responses type safe

const stats: FastifyPluginAsync = async (fastify, _opts): Promise<void> => {
  /**
   * @swagger
   * tags:
   *   name: Stats
   *   description: Statistics on chat messages
   */

  async function getTopTenByKey(key: string) {
    const ret = await fastify.redis.zrevrangebyscore(
      key,
      '+inf',
      0,
      'WITHSCORES',
      'LIMIT',
      0,
      10
    )
    return ret.reduce(
      (
        result: Array<Record<string, number>>,
        value: string,
        index: number,
        array: string[]
      ) => {
        if (index % 2 === 0) {
          const [word, count] = array.slice(index, index + 2)
          result.push({ [word]: parseInt(count, 10) })
        }

        return result
      },
      []
    )
  }

  async function getMessagesPerSecond(): Promise<MessagesPerSecond> {
    const currentSeconds = secondsSinceEpoch()
    const messagesPerSecond: Record<string, string> =
      await fastify.redis.hgetall(buildMessagesPerSecondKey(currentSeconds))
    return { messagesPerSecond: 0, ...messagesPerSecond }
  }

  /**
   * @swagger
   * /stats:
   *   get:
   *     tags: [Stats]
   *     description: Returns the number of messages per second
   *     responses:
   *       200:
   *         description:  messages per second
   */
  fastify.get('/', async (_request, reply) => {
    const res = await getMessagesPerSecond()

    void reply.header('Content-Type', 'application/json').send(res)
  })

  /**
   * @swagger
   * /stats/words:
   *   get:
   *     tags: [Stats]
   *     description: Returns the top 10 word counts across all messages in descending order
   *     responses:
   *       200:
   *         description:  word counts
   */
  fastify.get('/words', async (_request, reply) => {
    const res = await getTopTenByKey(WORDS_KEY)
    void reply.send(res)
  })

  /**
   * @swagger
   * /stats/nicks
   *   get:
   *     tags: [Stats]
   *     description: Returns the top 10 nick counts across all messages in descending order
   *     responses:
   *       200:
   *         description:  nick counts
   */
  fastify.get('/nicks', async (_request, reply) => {
    const res = await getTopTenByKey(NICKS_KEY)
    void reply.send(res)
  })

  /**
   * @swagger
   * /stats/rooms:
   *   get:
   *     tags: [Stats]
   *     description: Returns the top 10 room counts across all messages in descending order
   *     responses:
   *       200:
   *         description:  room counts
   */
  fastify.get('/rooms', async (_request, reply) => {
    const res = await getTopTenByKey(ROOMS_KEY)
    void reply.send(res)
  })

  fastify.get('/failedMessages', async (_request, reply) => {
    const failedMessages = await fastify.redis.smembers(FAILED_MESSAGES_KEY)
    void reply.send(failedMessages)
  })
}

export default stats
