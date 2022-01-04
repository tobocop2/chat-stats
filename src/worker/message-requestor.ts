import * as https from 'https'
import { createReadStream, ReadStream } from 'fs'
import { IncomingMessage } from 'http'

abstract class MessageRequestor<T> {
  abstract getResponseStream(path: string): Promise<T>
}

export class HttpMessageRequester extends MessageRequestor<IncomingMessage> {
  async getResponseStream(path: string): Promise<IncomingMessage> {
    return new Promise((resolve, reject) => {
      https.get(path, async (response: IncomingMessage) => {
        if (response.statusCode! < 200 || response.statusCode! >= 300) {
          reject(new Error(`statusCode=${response.statusCode!}`))
        }

        resolve(response)
      })
    })
  }
}

export class TextBasedMessageRequestor extends MessageRequestor<ReadStream> {
  async getResponseStream(path: string): Promise<ReadStream> {
    return new Promise(resolve => {
      resolve(createReadStream(path))
    })
  }
}
