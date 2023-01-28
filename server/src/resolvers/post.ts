import { Post } from "../entities/Post";
import {
  Query,
  Resolver,
  Arg,
  Mutation,
  InputType,
  Field,
  Ctx,
  UseMiddleware,
  Int,
  FieldResolver,
  Root,
  ObjectType,
} from "type-graphql";
import dataSource from "../datasource";
import { MyContext } from "src/types";
import { isAuth } from "../middleware/isAuth";
import { Vote } from "../entities/Vote";
import { User } from "../entities/User";

@InputType()
class PostInput {
  @Field()
  title: string;
  @Field()
  text: string;
}

@ObjectType()
class PaginatedPosts {
  @Field(() => [Post])
  posts: Post[];
  @Field()
  hasMore: boolean;
}

//graphql works with and decorators
@Resolver(Post)
export class PostResolver {
  @FieldResolver(() => String)
  textSnippet(@Root() root: Post) {
    return root.text.slice(0, 50);
  }

  @FieldResolver(() => User)
  creator(@Root() post: Post, @Ctx() { userLoader }: MyContext) {
    return userLoader.load(post.creatorId);
  }

  @FieldResolver(() => Int, { nullable: true })
  async voteStatus(@Root() post: Post, @Ctx() { voteLoader, req }: MyContext) {
    if (!req.session.userId) {
      return null;
    }

    const vote = await voteLoader.load({
      postId: post._id,
      userId: req.session.userId,
    });

    return vote ? vote.value : null;
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async vote(
    @Arg("postId", () => Int) postId: number,
    @Arg("value", () => Int) value: 1 | -1,
    @Ctx() { req }: MyContext
  ) {
    const isUpVote = value !== -1;
    const realValue = isUpVote ? 1 : -1;
    const { userId } = req.session;

    const voted = await Vote.findOne({ where: { postId, userId } });

    //if user has already voted on post before
    //and are changing their vote
    if (voted && voted.value !== realValue) {
      await dataSource.transaction(async (transactionManager) => {
        await transactionManager.query(
          `
            update vote
            set value = $1
            where "postId" = $2 and "userId" = $3
          `,
          [realValue, postId, userId]
        );

        await transactionManager.query(
          `
            update post
            set points = points + $1
            where _id = $2
          `,
          [2 * realValue, postId]
        );
      });
    } else if (!voted) {
      //has never voted before
      await dataSource.transaction(async (transactionManager) => {
        await transactionManager.query(
          `
            insert into vote ("userId", "postId", value)
            values ($1, $2, $3)
          `,
          [userId, postId, realValue]
        );

        await transactionManager.query(
          `
            update post
            set points = points + $1
            where _id = $2
          `,
          [realValue, postId]
        );
      });
    }

    return true;
  }

  //this decorator is taking posts as a function and returs an array of strings
  //Query is for getting data
  @Query(() => PaginatedPosts)
  async posts(
    @Arg("limit", () => Int) limit: number,
    @Arg("cursor", () => String, { nullable: true }) cursor: string | null,
    @Ctx() { req }: MyContext
  ): Promise<PaginatedPosts> {
    // 20 -> 21
    const realLimit = Math.min(50, limit);
    const reaLimitPlusOne = realLimit + 1;

    const replacements: any[] = [reaLimitPlusOne];

    if (cursor) {
      replacements.push(new Date(parseInt(cursor)));
    }
    console.log("🚀 ~ file: post.ts:144 ~ replacements", replacements);

    const posts = await dataSource
      .query(
        `
    select p.*
    from post p
    ${cursor ? `where p."createdAt" < $2` : ""}
    order by p."createdAt" DESC
    limit $1
    `,
        replacements
      )
      .catch((error) => {
        console.log("🚀 ~ file: post.ts:156 ~ error", error)
        
      });
    console.log("🚀 ~ file: post.ts:156 ~ posts", posts);

    return {
      posts: posts.slice(0, realLimit),
      hasMore: posts.length === reaLimitPlusOne,
    };
  }

  @Query(() => Post, { nullable: true })
  post(@Arg("_id", () => Int) _id: number): Promise<Post | null> {
    const postRepo = dataSource.getRepository(Post);
    return postRepo.findOne({
      relations: { creator: true },
      where: {
        _id,
      },
    });
  }

  //Mutation is for creating, deleting and updating
  @Mutation(() => Post)
  @UseMiddleware(isAuth)
  async createPost(
    @Arg("options") options: PostInput,
    @Ctx() { req }: MyContext
  ): Promise<Post | null> {
    return Post.create({
      ...options,
      creatorId: req.session.userId,
    }).save();
  }

  @Mutation(() => Post, { nullable: true })
  @UseMiddleware(isAuth)
  async updatePost(
    @Arg("_id", () => Int) _id: number,
    @Arg("title") title: string,
    @Arg("text") text: string,
    @Ctx() { req }: MyContext
  ): Promise<Post | null> {
    const result = await dataSource
      .createQueryBuilder()
      .update(Post)
      .set({ title, text })
      .where('_id = :_id and "creatorId" = :creatorId', {
        _id,
        creatorId: req.session.userId,
      })
      .returning("*")
      .execute();

    return result.raw[0];
  }

  @Mutation(() => Boolean, { nullable: true })
  @UseMiddleware(isAuth)
  async deletePost(
    @Arg("_id", () => Int) _id: number,
    @Ctx() { req }: MyContext
  ): Promise<Boolean> {
    await Post.delete({ _id, creatorId: req.session.userId });
    return true;
  }
}
