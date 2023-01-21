import { Request, Response } from "express"
import Redis from "ioredis";

export type MyContext = {
    // fork: EntityManager<IDatabaseDriver<Connection>>, microOrm
    req: Request & { session: Express.Session };
    redis: Redis;
    res: Response
}