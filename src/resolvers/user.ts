import { MyContext } from "../types";
import { Arg, Ctx, Field, InputType, Mutation, ObjectType, Query, Resolver } from "type-graphql";
import argon2 from 'argon2'
import { User } from "../entities/User";

//input types are used in arguments
@InputType()
class UsernamePasswordInput {
    @Field()
    username: string

    @Field()
    password: string
}

@ObjectType()
class FieldError {
    @Field()
    field?: string;

    @Field()
    message?: string
}

// object types are send to mutations  
@ObjectType()
class UserResponse {
    @Field(() => User, { nullable: true })
    user?: User;

    @Field(() => [FieldError], { nullable: true })
    errors?: FieldError[]
}

@Resolver()
export class UserResolver {
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
    async register(@Arg("options") options: UsernamePasswordInput,
        @Ctx() { fork, req }: MyContext
    ): Promise<UserResponse | null> {
        if (options.username.length <= 2) {
            return {
                errors: [
                    {
                        field: "username",
                        message: "length must be greater than 2"
                    }
                ]
            }
        }
        if (options.password.length <= 2) {
            return {
                errors: [
                    {
                        field: "password",
                        message: "length must be greater than 2"
                    }
                ]
            }
        }
        const hashedPassword = await argon2.hash(options.password)
        const user = fork.create(User, { username: options.username, password: hashedPassword })
        try {
            await fork.persistAndFlush(user)
        } catch (error) {
            if (error.code === '23505' || error.detail.includes('already exist')) {
                return {
                    errors: [
                        {
                            field: 'username',
                            message: 'User already exists'
                        }
                    ]
                }
            }
        }

        //store user id session
        //this will set a cookie on the user
        //keep them logged in
        req.session!.userId = user._id;

        return { user }
    }

    //Mutation is for creating, deleting and updating
    @Mutation(() => UserResponse)
    async login(@Arg("options") options: UsernamePasswordInput,
        @Ctx() { fork, req }: MyContext
    ): Promise<UserResponse | null> {
        try {
            const user = await fork.findOne(User, { username: options.username })
        if (!user) {
            return {
                errors: [
                    {
                        field: "username",
                        message: "username does not exist"
                    }
                ]
            }
        }
        const valid = await argon2.verify(user?.password, options.password)
        if (!valid) {
            return {
                errors: [
                    {
                        field: "password",
                        message: "incorrect password input"
                    }
                ]
            }
        }

        req.session!.userId = user._id;

        return { user }
        } catch (error) {
            console.error(error.message)
            return null
        }
    }
}