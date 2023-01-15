import { Options } from "@mikro-orm/postgresql";
import path from "path";
import { __prod__ } from "./constants";
import { Post } from "./entities/Post";
import { User } from "./entities/User";

const config: Options = {
    migrations:{
        path: path.join(__dirname, './migrations'), // path to the folder with migrations
        pathTs: undefined, // path to the folder with TS migrations (if used, we should put path to compiled files in `path`),
        glob: '!(*.d).{js,ts}', // how to match migration files (all .js and .ts files, but not .d.ts)
    },
    entities: [Post, User],
    dbName: 'redditClone',
    user: 'postgres',
    password: 'postgres',
    type: 'postgresql',
    debug: !__prod__,
    port: 5433
}

export default config;