import { MyContext } from "../types";
import { Arg, Ctx, Field, InputType, Mutation, ObjectType, Query, Resolver } from "type-graphql";
import argon2 from "argon2";
import { User } from "../entities/User";
import { COOKIE_NAME } from "../constants";

//input types are used in arguments
@InputType()
class UsernamePasswordInput {
  @Field()
  username: string;

  @Field()
  email: string;

  @Field()
  password: string;
}

@ObjectType()
class FieldError {
  @Field()
  field?: string;

  @Field()
  message?: string;
}

// object types are send to mutations
@ObjectType()
class UserResponse {
  @Field(() => User, { nullable: true })
  user?: User;

  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];
}

@Resolver()
export class UserResolver {
  @Mutation(() => Boolean)
  async forgotPassword(@Arg("email") email: string, @Ctx() { fork, req }: MyContext) {
    // const user = await fork.findOne(User, {email})
    return true;
  }

  @Query(() => User, { nullable: true })
  async me(@Ctx() { req, fork }: MyContext) {
    if (!req.session!.userId) {
      return null;
    }

    const user = await fork.findOne(User, { _id: req.session!.userId });
    return user;
  }

  //Mutation is for creating, deleting and updating
  @Mutation(() => UserResponse)
  async register(@Arg("options", { nullable: true }) { username, password, email }: UsernamePasswordInput, @Ctx() { fork, req }: MyContext): Promise<UserResponse> {
    if (email.includes("@")) {
      return {
        errors: [
          {
            field: "email",
            message: "invalid email",
          },
        ],
      };
    }
    if (username.length <= 2) {
      return {
        errors: [
          {
            field: "username",
            message: "length must be greater than 2",
          },
        ],
      };
    }
    if (password.length <= 2) {
      return {
        errors: [
          {
            field: "password",
            message: "length must be greater than 2",
          },
        ],
      };
    }
    const hashedPassword = await argon2.hash(password);
    const user = fork.create(User, { username: username, password: hashedPassword, email: email });
    try {
      // const result = await (fork as EntityManager)
      // .createQueryBuilder(User)
      // .getKnexQuery()
      // .insert({
      //   username: username,
      //   password: hashedPassword,
      //   created_at: new Date(),
      //   updated_at: new Date(),
      // })
      // .returning("*");
      // user = result[0];
      await fork.persistAndFlush(user);
    } catch (error) {
      if (error.code === "23505" || error.detail.includes("already exist")) {
        return {
          errors: [
            {
              field: "username",
              message: "User already exists",
            },
          ],
        };
      }
    }

    //store user id session
    //this will set a cookie on the user
    //keep them logged in

    req.session!.userId = user._id;

    return { user };
  }

  //Mutation is for creating, deleting and updating
  @Mutation(() => UserResponse)
  async login(@Arg("usernameOrEmail") usernameOrEmail: string, @Arg("password") password: string, @Ctx() { fork, req }: MyContext): Promise<UserResponse | null> {
    try {
      const user = await fork.findOne(User, usernameOrEmail.includes("@") ? { email: usernameOrEmail } : { username: usernameOrEmail });
      if (!user) {
        return {
          errors: [
            {
              field: "username",
              message: "username does not exist",
            },
          ],
        };
      }
      const valid = await argon2.verify(user?.password, password);
      if (!valid) {
        return {
          errors: [
            {
              field: "password",
              message: "incorrect password input",
            },
          ],
        };
      }

      req.session!.userId = user._id;

      return { user };
    } catch (error) {
      console.error(error.message);
      return null;
    }
  }

  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: MyContext) {
    return new Promise((resolve) =>
      req.session?.destroy((error) => {
        res.clearCookie(COOKIE_NAME);
        if (error) {
          console.log("🚀 ~ file: user.ts:149 ~ req.session?.destroy ~ error", error);
          resolve(false);
          return;
        }
        resolve(true);
      })
    );
  }
}
