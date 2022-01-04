import { ParsedMessage } from './types'

export function parseMessage(rawMessage: string): ParsedMessage {
  const {
    room = '',
    nick = '',
    body = ''
  } = JSON.parse(rawMessage) as ParsedMessage
  return { room, nick, body }
}

export function parseWords(body: string): string[] {
  // NOTE: due to the complicated nature of parsing out words in multiple languages
  // as well as removing specific symbols, a word is just assumed to be anything
  // separated by a space
  return body.split(' ') ?? []
}
