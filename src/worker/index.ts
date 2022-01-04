import { MessageWorker } from './worker'
import { config } from '../config'

function main() {
  new MessageWorker().run(config.chatInterfaceUrl)
}

main()
