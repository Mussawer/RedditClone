import { Post } from "../entities/Post";
import { Query, Resolver, Arg, Mutation, InputType, Field, Ctx, UseMiddleware } from "type-graphql";
import dataSource from "../datasource";
import { MyContext } from "src/types";
import { isAuth } from "../middleware/isAuth";


@InputType()
class PostInput {
  @Field()
  title: string;
  @Field()
  text: string;
}

//graphql works with and decorators
@Resolver()
export class PostResolver {
  //this decorator is taking posts as a function and returs an array of strings
  //Query is for getting data
  @Query(() => [Post])
  posts(): Promise<Post[]> {
    return Post.find();
  }

  @Query(() => Post, { nullable: true })
  post(@Arg("_id") _id: number): Promise<Post | null> {
    const postRepository = dataSource.getRepository(Post);
    return postRepository.findOne({ where: { _id } });
  }

  //Mutation is for creating, deleting and updating
  @Mutation(() => Post)
  @UseMiddleware(isAuth)
  async createPost(@Arg("options") options: PostInput, @Ctx() {req}: MyContext): Promise<Post | null> {
    return Post.create({ 
        ...options,
        creatorId: req.session.userId
     }).save();
  }

  @Mutation(() => Post, { nullable: true })
  async updatePost(@Arg("_id") _id: number, @Arg("title", () => String, { nullable: true }) title: string): Promise<Post | null> {
    const post = await Post.findOne({ where: { _id } });
    if (!post) {
      return null;
    }
    if (typeof title !== "undefined") {
      await Post.update({ _id }, { title });
    }
    return post;
  }

  @Mutation(() => Boolean, { nullable: true })
  async deletePost(@Arg("_id") _id: number): Promise<Boolean> {
    await Post.delete(_id);
    return true;
  }
}
