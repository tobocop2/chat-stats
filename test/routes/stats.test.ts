import * as path from "path";

import { test } from "tap";

import { build } from "../helper";

const testDataPath: string = path.join(
  path.dirname(path.dirname(__filename)),
  "test-data"
);

// @todo add tests for messages per second

void test("Chat Statistics", async (t) => {
  const app = await build(t);
  const worker = app.worker!;
  const { redisClient } = worker;

  const clearDb = async () => {
    // @todo make this clear only the keys in the namespace
    await redisClient.flushdb();
    // const stream = redisClient.scanStream(({ match: 'test-chat-stats:*' }))
    // for await (const keys of stream) {
    //   if (keys.length) {
    //     const r = await redisClient.unlink(...keys)
    //   }
    // }
  };

  t.beforeEach(async (_) => {
    await clearDb();
  });

  void t.test("messages per second returns expected", async (t) => {
    const res = await app.inject({
      url: "/stats",
    });

    t.equal(res.statusCode, 200, "returns a status code of 200");
    t.same(res.json(), { messagesPerSecond: 0 });
  });

  void t.test("word count returns expected", async (t) => {
    const res = await app.inject({
      url: "/stats/words",
    });

    t.equal(res.statusCode, 200, "returns a status code of 200");
    t.same(res.json(), []);
  });

  void t.test("room count returns expected", async (t) => {
    const res = await app.inject({
      url: "/stats/rooms",
    });

    t.equal(res.statusCode, 200, "returns a status code of 200");
    t.same(res.json(), []);
  });

  void t.test("nick count returns expected", async (t) => {
    const res = await app.inject({
      url: "/stats/nicks",
    });

    t.equal(res.statusCode, 200, "returns a status code of 200");
    t.same(res.json(), []);
  });

  void t.test("duplicate words counted", async (t) => {
    await clearDb();
    await worker.run(`${testDataPath}/duplicate-words-counted.txt`);
    const res = await app.inject({
      url: "/stats/words",
    });

    t.equal(res.statusCode, 200, "returns a status code of 200");
    const wordCounts: Array<Record<string, number>> = res.json();
    t.same(wordCounts, [{ rgb: 3 }]);
  });

  void t.test("empty nick is ignored", async (t) => {
    await worker.run(`${testDataPath}/empty-nick.txt`);
    const res = await app.inject({
      url: "/stats/nicks",
    });

    t.equal(res.statusCode, 200, "returns a status code of 200");
    const nickCounts: Array<Record<string, number>> = res.json();
    t.same(nickCounts, []);
  });

  void t.test("empty room is ignored", async (t) => {
    await worker.run(`${testDataPath}/empty-room.txt`);
    const res = await app.inject({
      url: "/stats/rooms",
    });

    t.equal(res.statusCode, 200, "returns a status code of 200");
    const roomCounts: Array<Record<string, number>> = res.json();
    t.same(roomCounts, []);
  });

  void t.test("empty body is ignored", async (t) => {
    await worker.run(`${testDataPath}/empty-body.txt`);
    const res = await app.inject({
      url: "/stats/words",
    });

    t.equal(res.statusCode, 200, "returns a status code of 200");
    const wordCounts: Array<Record<string, number>> = res.json();
    t.same(wordCounts, []);
  });

  void t.test("non ascii words supported", async (t) => {
    await worker.run(`${testDataPath}/non-ascii.txt`);
    const res = await app.inject({
      url: "/stats/words",
    });

    t.equal(res.statusCode, 200, "returns a status code of 200");
    const roomCounts: Array<Record<string, number>> = res.json();

    t.same(roomCounts, [{ ㅋㅋㅋㅋㅋㅋㅋ: 1 }]);
  });

  void t.test(
    "improperly formatted json is stored off as expected",
    async (t) => {
      await worker.run(`${testDataPath}/improper-json.txt`);
      const res = await app.inject({
        url: "/stats/failedMessages",
      });

      t.equal(res.statusCode, 200, "returns a status code of 200");
      const failedMessages: Array<Record<string, number>> = res.json();

      t.equal(failedMessages.length, 1);
    }
  );
});

void test("Single Message", async (t) => {
  const app = await build(t);
  const worker = app.worker!;
  const { redisClient } = worker;

  const clearDb = async () => {
    // @todo make this clear only the keys in the namespace
    await redisClient.flushdb();
    // const stream = redisClient.scanStream(({ match: 'test-chat-stats:*' }))
    // for await (const keys of stream) {
    //   if (keys.length) {
    //     const r = await redisClient.unlink(...keys)
    //   }
    // }
  };

  t.before(async () => {
    await clearDb();
    await worker.run(`${testDataPath}/single-message.txt`);
  });

  void t.test("expected nick counts returned", async (t) => {
    const res = await app.inject({
      url: "/stats/nicks",
    });

    t.equal(res.statusCode, 200, "returns a status code of 200");
    const nickCounts: Array<Record<string, number>> = res.json();
    t.same(nickCounts, [{ scropion77: 1 }]);
  });

  void t.test("expected room counts returned", async (t) => {
    const res = await app.inject({
      url: "/stats/rooms",
    });

    t.equal(res.statusCode, 200, "returns a status code of 200");
    const roomCounts: Array<Record<string, number>> = res.json();
    t.same(roomCounts, [{ "#yulayabgu": 1 }]);
  });

  void t.test("expected word counts returned", async (t) => {
    const res = await app.inject({
      url: "/stats/words",
    });

    t.equal(res.statusCode, 200, "returns a status code of 200");
    const wordCounts: Array<Record<string, number>> = res.json();
    t.same(wordCounts, [
      {
        kap: 1,
      },
      {
        gel: 1,
      },
      {
        başkan: 1,
      },
    ]);
  });
});

void test("Multiple Messages", async (t) => {
  const app = await build(t);
  const worker = app.worker!;
  const { redisClient } = worker;

  const clearDb = async () => {
    // @todo make this clear only the keys in the namespace
    await redisClient.flushdb();
    // const stream = redisClient.scanStream(({ match: 'test-chat-stats:*' }))
    // for await (const keys of stream) {
    //   if (keys.length) {
    //     const r = await redisClient.unlink(...keys)
    //   }
    // }
  };

  t.before(async () => {
    await clearDb();
    await worker.run(`${testDataPath}/multiple-messages.txt`);
  });

  void t.test("expected nick counts returned", async (t) => {
    const res = await app.inject({
      url: "/stats/nicks",
    });

    t.equal(res.statusCode, 200, "returns a status code of 200");
    const nickCounts: Array<Record<string, number>> = res.json();
    t.same(nickCounts, [
      {
        slicyyyy: 3,
      },
      {
        moczark: 2,
      },
      {
        zexvy: 1,
      },
      {
        vidaalheia: 1,
      },
      {
        twyx610: 1,
      },
      {
        scropion77: 1,
      },
      {
        enzo2009123: 1,
      },
    ]);
  });

  void t.test("expected room counts returned", async (t) => {
    const res = await app.inject({
      url: "/stats/rooms",
    });

    t.equal(res.statusCode, 200, "returns a status code of 200");
    const roomCounts: Array<Record<string, number>> = res.json();
    t.same(roomCounts, [
      {
        "#slicyyyon60fps": 3,
      },
      {
        "#sadparu": 2,
      },
      {
        "#yulayabgu": 1,
      },
      {
        "#samiachanneltv": 1,
      },
      {
        "#danthebnn": 1,
      },
      {
        "#4ozo": 1,
      },
      {
        "#4lveeri4no": 1,
      },
    ]);
  });

  void t.test("expected word counts returned", async (t) => {
    const res = await app.inject({
      url: "/stats/words",
    });

    t.equal(res.statusCode, 200, "returns a status code of 200");
    const wordCounts: Array<Record<string, number>> = res.json();

    t.same(wordCounts, [
      {
        MEUBEL: 3,
      },
      {
        our: 2,
      },
      {
        you: 1,
      },
      {
        what: 1,
      },
      {
        troca: 1,
      },
      {
        seen: 1,
      },
      {
        po: 1,
      },
      {
        o: 1,
      },
      {
        kap: 1,
      },
      {
        gel: 1,
      },
    ]);
  });
});
