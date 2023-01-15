import { Post } from "../entities/Post";
import { MyContext } from "src/types";
import { Ctx, Query, Resolver, Arg, Int, Mutation } from "type-graphql";


//graphql works with and decorators
@Resolver()
export class PostResolver {
    //this decorator is taking posts as a function and returs an array of strings 
    //Query is for getting data
    @Query(() => [Post])
    posts(@Ctx() { fork }: MyContext): Promise<Post[]> {
        return fork.find(Post, {})
    }
    
    @Query(() => Post, { nullable: true })
    post(@Arg("_id", () => Int) _id: number,
        @Ctx() { fork }: MyContext
    ): Promise<Post | null> {
        return fork.findOne(Post, { _id })
    }

    //Mutation is for creating, deleting and updating
    @Mutation(() => Post)
    async createPost(@Arg("title") title: string,
        @Ctx() { fork }: MyContext
    ): Promise<Post | null> {
        const post = fork.create(Post, { title })
        await fork.persistAndFlush(post)
        return post
    }

    @Mutation(() => Post, { nullable: true })
    async updatePost(@Arg("_id") _id: number, @Arg("title", () => String, { nullable: true }) title: string,
        @Ctx() { fork }: MyContext
    ): Promise<Post | null> {
        const post = await fork.findOne(Post, { _id })
        if (!post) {
            return null
        }
        if(typeof title !== "undefined"){
            post.title = title
            await fork.persistAndFlush(post)
        }
        return post
    }

    @Mutation(() => Boolean, { nullable: true })
    async deletePost(@Arg("_id") _id: number,
        @Ctx() { fork }: MyContext
    ): Promise<Boolean> {
        await fork.nativeDelete(Post, {_id})
        return true
    }
}