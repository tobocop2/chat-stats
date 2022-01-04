// By just looking for one level of JSON we reduce the need to
// look for any headers in the payload like "se-data:" for example
// https://stackoverflow.com/a/63660736
export const LEVEL_ONE_JSON_REGEX = new RegExp(/\{(?:[^{}]|())*\}/)

// Regex shamelessly stolen from https://stackoverflow.com/a/49718320
// Attempted to split out all words, but then realized this wouldn't support multilingual messages
// export const WORD_SPLIT_REGEX = new RegExp(/\w+(?:'\w+)*/g)

export const ROOMS_KEY = 'rooms'

export const NICKS_KEY = 'nicks'

export const WORDS_KEY = 'words'

export const MESSAGES_PER_SECOND_KEY_PREFIX = 'messagesPerSecond'

export const FAILED_MESSAGES_KEY = 'failedMessages'
