import { MESSAGES_PER_SECOND_KEY_PREFIX } from './constants'

export function secondsSinceEpoch(): number {
  return Math.round(Date.now() / 1000)
}

export function buildMessagesPerSecondKey(seconds: number): string {
  return `${MESSAGES_PER_SECOND_KEY_PREFIX}:${seconds}`
}
