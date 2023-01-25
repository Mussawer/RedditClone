import { MyContext } from "../types";
import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
} from "type-graphql";
import argon2 from "argon2";
import { User } from "../entities/User";
import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from "../constants";
import { UsernamePasswordInput } from "./UsernamePasswordInput";
import { validateRegister } from "../utils/validateRegister";
import { sendEmail } from "../utils/sendEmail";
import { v4 } from "uuid";
import dataSource from "../datasource";
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

@Resolver(User)
export class UserResolver {
  @FieldResolver(() => String)
  email(@Root() user: User, @Ctx() { req }: MyContext) {
    //current user its ok to show their own email
    if (req.session.userId === user._id) {
      return user.email;
    }
    return "";
  }
  @Mutation(() => UserResponse)
  async changePassword(
    @Arg("token") token: string,
    @Arg("newPassword") newPassword: string,
    @Ctx() { redis, req }: MyContext
  ): Promise<UserResponse> {
    if (newPassword.length <= 2) {
      return {
        errors: [
          {
            field: "newPassword",
            message: "length must be greater than 2",
          },
        ],
      };
    }

    const key = FORGET_PASSWORD_PREFIX + token;
    const userId = await redis.get(key);
    if (!userId) {
      return {
        errors: [
          {
            field: "token",
            message: "token expired",
          },
        ],
      };
    }

    const userIdNum = parseInt(userId);
    const userRepository = dataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { _id: userIdNum } });

    if (!user) {
      return {
        errors: [
          {
            field: "token",
            message: "user no longer exists",
          },
        ],
      };
    }

    // await fork.persistAndFlush(user);
    await User.update(
      { _id: userIdNum },
      {
        password: await argon2.hash(newPassword),
      }
    );
    await redis.del(key);

    // log in user after change password
    req.session.userId = user._id;

    return { user };
  }

  @Mutation(() => Boolean)
  async forgotPassword(@Arg("email") email: string, @Ctx() { redis }: MyContext) {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return true;
    }
    const token = v4();
    await redis.set(FORGET_PASSWORD_PREFIX + token, user._id, "EX", 1000 * 60 * 60 * 24); // 1day
    await sendEmail(
      email,
      `<a href="http://localhost:3001/change-password/${token}">reset password</a>`
    );
    return true;
  }

  @Query(() => User, { nullable: true })
  async me(@Ctx() { req }: MyContext) {
    if (!req.session!.userId) {
      return null;
    }

    const user = await User.findOne({ where: { _id: req.session!.userId } });
    return user;
  }

  //Mutation is for creating, deleting and updating
  @Mutation(() => UserResponse)
  async register(
    @Arg("options", { nullable: true }) { username, password, email }: UsernamePasswordInput,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const errors = validateRegister({ username, password, email });
    if (errors) {
      return { errors };
    }
    const hashedPassword = await argon2.hash(password);
    let user;
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
      const result = await dataSource
        .createQueryBuilder()
        .insert()
        .into(User)
        .values({ username: username, password: hashedPassword, email: email })
        .returning("*")
        .execute();
      user = result.raw[0];
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
  async login(
    @Arg("usernameOrEmail") usernameOrEmail: string,
    @Arg("password") password: string,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse | null> {
    try {
      const user = await User.findOne(
        usernameOrEmail.includes("@")
          ? { where: { email: usernameOrEmail } }
          : { where: { username: usernameOrEmail } }
      );
      if (!user) {
        return {
          errors: [
            {
              field: "usernameOrEmail",
              message: "username or email does not exist",
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
          resolve(false);
          return;
        }
        resolve(true);
      })
    );
  }
}
