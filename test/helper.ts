// This file contains code that we reuse between our tests.
import Fastify, { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import * as tap from "tap";

import App from "../src/app";
import { config, Config } from "../src/config";
import { MessageWorker } from "../src/worker/worker";

export type Test = typeof tap["Test"]["prototype"];

// Automatically build and tear down our instance
async function build(t: Test) {
  // eslint-disable-next-line new-cap
  const app = Fastify();

  // Fastify-plugin ensures that all decorators
  // are exposed for testing purposes, this is
  // different from the production setup
  const opts: Config = {
    ...config,
    nodeEnv: "test",
    workerMode: "text",
    redisNamespace: "test-chat-stats:",
  };
  void app.register(fp(App), opts);
  app.decorate("worker", new MessageWorker(opts, false));

  const decoratedApp = app as FastifyInstance &
    Partial<{ worker: MessageWorker }>;

  await decoratedApp.ready();

  // Tear down our app after we are done
  t.teardown(async () => {
    await decoratedApp.close();
    decoratedApp.worker!.close();
  });

  return decoratedApp;
}

export { config, build };
