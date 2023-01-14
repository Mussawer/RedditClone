import 'reflect-metadata';
import {MikroORM} from '@mikro-orm/core';
import { __prod__ } from './constants';
import { Post } from './entities/Post';
import mikroOrmConfig from './mikro-orm.config';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { PostResolver } from './resolvers/post';
const main = async () => {
    const orm = await MikroORM.init(mikroOrmConfig)
    await orm.getMigrator().up()

    const app = express();
    const apolloServer = new ApolloServer({
        //buildschema returns a promise with graphql schema
        schema: await buildSchema({
            resolvers: [PostResolver],
            validate: false
        }),
        //special object that is accessible to all resolvers
        context: () => ({
            fork: orm.em.fork()
        })
    })

    await apolloServer.start()

    apolloServer.applyMiddleware({app})
    app.listen(4000, () => {
        console.log("hello")
    })
}

main().catch((error)=>{
    console.error(error)
})
