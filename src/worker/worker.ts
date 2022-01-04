import * as readline from 'readline'
import { IncomingMessage } from 'http'
import { ReadStream } from 'fs'
import { Pipeline, Redis } from 'ioredis'

import { config, Config } from '../config'
import {
  LEVEL_ONE_JSON_REGEX,
  ROOMS_KEY,
  NICKS_KEY,
  WORDS_KEY,
  FAILED_MESSAGES_KEY
} from '../constants'

import {
  HttpMessageRequester,
  TextBasedMessageRequestor
} from './message-requestor'
import { buildMessagesPerSecondKey, secondsSinceEpoch } from '../utils'
import { createRedisClient } from '../redis'
import { MessagesPerSecond } from '../types'

import { RedisStorageError } from './errors'
import { ParsedMessage } from './types'
import { parseMessage, parseWords } from './utils'

type PiplineResponse = Array<[Error | null, any]>

export class MessageWorker {
  public readonly redisClient: Redis
  private currentSecondsFromEpoch: number = secondsSinceEpoch()
  private messagesPerSecond = 0
  private readonly env: string
  private readonly msgRequestor:
    | HttpMessageRequester
    | TextBasedMessageRequestor
  private readonly closeClient: Boolean

  constructor(opts: Config = config, closeClient: Boolean = true) {
    this.redisClient = createRedisClient(opts.redisNamespace)
    this.closeClient = closeClient
    this.env = opts.nodeEnv ?? 'production'
    switch (opts.workerMode) {
      case 'text':
        this.msgRequestor = new TextBasedMessageRequestor()
        break
      case 'http':
      default:
        this.msgRequestor = new HttpMessageRequester()
        break
    }
  }

  public async run(path: string): Promise<void> {
    this.currentSecondsFromEpoch = secondsSinceEpoch()
    const responseStream = await this.msgRequestor.getResponseStream(path)
    await this.processMessages(responseStream)
  }

  public close(): void {
    this.redisClient.disconnect()
  }

  private async handlePiplineResponse(
    res: PiplineResponse
  ): Promise<void | RedisStorageError> {
    const errors = res.reduce((acc: Array<string | undefined>, [err]) => {
      if (err) acc.push(err.message)
      return acc
    }, [])

    if (errors.length) {
      throw new RedisStorageError(errors.join('\n'))
    }
  }

  private async handleError(err: any, param: string): Promise<void> {
    await this.redisClient.sadd(FAILED_MESSAGES_KEY, param)
  }

  private async writeMessage(
    obj: ParsedMessage
  ): Promise<void | RedisStorageError> {
    const words: string[] = parseWords(obj.body)
    const pipeline: Pipeline = this.redisClient.pipeline()

    if (obj.room.trim()) pipeline.zincrby(ROOMS_KEY, 1, obj.room)
    if (obj.nick.trim()) pipeline.zincrby(NICKS_KEY, 1, obj.nick)

    words.reduce(
      (acc: Pipeline, word: string) => acc.zincrby(WORDS_KEY, 1, word),
      pipeline
    )

    const ret: PiplineResponse = await pipeline.exec()
    // message has been written for consumption at this point so any additional handling can be fired and forgotten
    void this.handlePiplineResponse(ret)
  }

  private writeMessagesPerSecond(seconds: number, messagesPerSecond: number) {
    const expireSeconds = 5
    const payload: MessagesPerSecond = { messagesPerSecond }
    const keyWithTime: string = buildMessagesPerSecondKey(seconds)
    this.redisClient
      .pipeline()
      .hset(keyWithTime, payload)
      .expire(keyWithTime, expireSeconds)
      .exec()
      .then(res => {
        void this.handlePiplineResponse(res)
      })
      .catch(err => {
        void this.handleError(err, JSON.stringify(payload))
      })
  }

  private async processMessage(rawMsg: string): Promise<void> {
    try {
      const stat: ParsedMessage = parseMessage(rawMsg)
      await this.writeMessage(stat)
    } catch (err: unknown) {
      void this.handleError(err, rawMsg)
    }
  }

  private async processMessages(
    response: IncomingMessage | ReadStream
  ): Promise<void> {
    if (this.env !== 'test') {
      console.log('Processing messages...')
    }
    const rl: readline.Interface = readline.createInterface({
      input: response
    })

    for await (const line of rl) {
      const match = line.match(LEVEL_ONE_JSON_REGEX)
      if (match) {
        const [rawMsg] = match
        await this.processMessage(rawMsg)
        const seconds = secondsSinceEpoch()
        if (seconds === this.currentSecondsFromEpoch) {
          ++this.messagesPerSecond
        } else {
          this.writeMessagesPerSecond(seconds, this.messagesPerSecond)
          this.messagesPerSecond = 0
          this.currentSecondsFromEpoch = seconds
        }
      }
    }

    if (this.closeClient) this.close()
  }
}
