import "reflect-metadata";
import { COOKIE_NAME, __prod__ } from "./constants";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import session from "express-session";
import Redis from "ioredis";
import connectRedis from "connect-redis";
import cors from "cors";
import dataSource from "./datasource";

const main = async () => {

  await dataSource.initialize();

  // const orm = await MikroORM.init(mikroOrmConfig);
  // await orm.getMigrator().up(); for micro-orm

  const app = express();

  const RedisStore = connectRedis(session);
  let redis = new Redis();

  // app.set("trust proxy", 1);
  const corsConfig = {
    // origin: "*",
    // methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    // preflightContinue: false,
    // optionsSuccessStatus: 204,
    origin:"http://localhost:3001",
    credentials:true
  };
  app.use(cors(corsConfig));
  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({ client: redis, disableTouch: true }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24, // 1 day
        sameSite: "lax", //csrf
        secure: __prod__,
        httpOnly: true,
      },
      saveUninitialized: false,
      secret: "keyboard cat",
      resave: false,
    })
  );

  const apolloServer = new ApolloServer({
    //buildschema returns a promise with graphql schema
    schema: await buildSchema({
      resolvers: [PostResolver, UserResolver],
      validate: false,
    }),
    //special object that is accessible to all resolvers
    //can send session through req and res
    context: ({ req, res }) => ({
      // fork: orm.em.fork(), for micro-orm
      req,
      res,
      redis
    }),
  });

  await apolloServer.start();

  apolloServer.applyMiddleware({
    app,
    // path: '/',
    // cors:{
    //   origin:"http://localhost:3000",
    //   credentials:true
    // },
    cors:false
  });
  app.listen(4000, () => {
    console.log("hello");
  });
};

main().catch((error) => {
  console.error(error);
});
