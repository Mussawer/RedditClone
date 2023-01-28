import { Request, Response } from "express"
import Redis from "ioredis";
import { createUserLoader } from "./utils/createUserLoader";
import { createVoteLoader } from "./utils/createVoteLoader";

export type MyContext = {
    // fork: EntityManager<IDatabaseDriver<Connection>>, microOrm
    req: Request & { session: Express.Session };
    redis: Redis;
    res: Response
    userLoader: ReturnType<typeof createUserLoader>
    voteLoader: ReturnType<typeof createVoteLoader>
}