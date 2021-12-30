### Objective

Your assignment is to implement a chat aggregation service using Typescript/Go and any framework.

### Brief

Chatstats is a service that processes a stream of incoming chat messages and converts it into realtime stats via a REST API.

The real-time interface can be accessed via this URI: https://chat-interview-proxy-63u64o32qq-ez.a.run.app?key=<TASK_KEY>

> Example: curl -s https://chat-interview-proxy-63u64o32qq-ez.a.run.app?key=<TASK_KEY>

### Tasks
-   Implement assignment using:
    -   Language: **Go/Typescript**
    -   Framework: **any framework**
    -   Four endpoints are required
        -   /stats - Returns the current messages per second.
        -   /stats/words - Returns a list of the top 10 most used words.
        -   /stats/nicks - Returns a list of the top 10 nicks (most messages).
        -   /stats/rooms - Returns a list of the top 10 rooms (most messages).
    -   All endpoints should return JSON
-   There is no restriction on how your parsing algorithm should work. You just need to make sure that the stats returned are correct.
-   Provide detailed instructions on how to run your assignment in a separate markdown file
-   Provide API tests for all endpoints

### Definitions
The format of every chat line is:
```
event: privmsg
se-data: {“command”:“”,“room”:“#adanion”,“nick”:“nebturion”,“target”:“”,“body”:“I am the message”,“tags”:“badges=;color=#8A2BE2;display-name=Nebturion;emotes=;flags=8-11:P.5;id=f052b98d-3996-4b99-9088-708e41b4970d;mod=0;room-id=30789646;subscriber=0;tmi-sent-ts=1549448281083;turbo=0;user-id=196546575;user-type=“}
```

| Type  | Definition                                                    |
|-------|---------------------------------------------------------------|
| Room  | The room                                                   |
| Nick  | The user who wrote the mssage (the "chatter")                 |
| Body  | The message                                                   |
| Tags  | matadata about the message in IRC form. (Should be ignored)   |

### Evaluation Criteria

-   **Go/Typescript** best practices
-   Endpoints works and behave as expected
-   Performance
-   Scalability 

### CodeSubmit

Please organize, design, test and document your code as if it were going into production - then push your changes to the master branch. After you have pushed your code, you may submit the assignment on the assignment page.

All the best and happy coding,

The StreamElements Team
