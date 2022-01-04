// Require library to exit fastify process, gracefully (if possible)
import closeWithGrace from 'close-with-grace'
// Require the framework
import Fastify from 'fastify'

import { config } from './config'
import { initSwagger } from './swagger'

// Instantiate Fastify with some config
// eslint-disable-next-line new-cap
const app = Fastify({
  logger: true
})

// Register your application as a normal plugin.
void app.register(import('./app'), config)

// Init Swagger
initSwagger(app)

// Delay is the number of milliseconds for the graceful close to finish
const closeListeners = closeWithGrace({ delay: 500 }, async (opts: any) => {
  if (opts.err) {
    app.log.error(opts.err)
  }

  await app.close()
})

app.addHook('onClose', async (_instance, done) => {
  closeListeners.uninstall()
  done()
})

// Start listening.
app.listen(
  config.nodePort ?? 3000,
  config.nodeHost ?? '0.0.0.0',
  (err: any) => {
    if (err) {
      app.log.error(err)
      process.exit(1)
    }
  }
)

export { app }
