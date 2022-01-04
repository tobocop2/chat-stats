import { envSchema } from 'env-schema'
import * as dotEnv from 'dotenv'
import fluentSchema from 'fluent-json-schema'

dotEnv.config({ path: __dirname + '/.env' })

type WorkerResponseStreamMode = 'http' | 'text'

export interface Config {
  chatInterfaceUrl: string
  redisPort: number
  redisHost: string
  nodePort: number
  nodeHost: string
  nodeEnv: string
  redisNamespace: string
  workerMode: WorkerResponseStreamMode
}

const env = envSchema({
  dotenv: true,
  schema: fluentSchema
    .object()
    .prop('CHAT_INTERFACE_URL', fluentSchema.string().required())
    .prop('REDIS_PORT', fluentSchema.number().required())
    .prop('REDIS_HOST', fluentSchema.string().required())
    .prop('REDIS_NAMESPACE', fluentSchema.string())
    .prop('NODE_PORT', fluentSchema.number().required())
    .prop('NODE_HOST', fluentSchema.string().required())
    .prop('NODE_ENV', fluentSchema.string())
    .prop('REDIS_NAMESPACE', fluentSchema.string())
})

export const config: Config = {
  chatInterfaceUrl: env.CHAT_INTERFACE_URL as string,
  redisPort: env.REDIS_PORT as number,
  redisHost: env.REDIS_HOST as string,
  nodePort: env.NODE_PORT as number,
  nodeEnv: env.NODE_ENV as string,
  nodeHost: env.NODE_HOST as string,
  redisNamespace: (env.REDIS_NAMESPACE as string) ?? 'chat-stats:',
  workerMode: (env.RESPONSE_STREAM_MODE as WorkerResponseStreamMode) ?? 'http'
}
