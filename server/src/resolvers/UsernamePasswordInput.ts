import { Field, InputType } from "type-graphql";

//input types are used in arguments

@InputType()
export class UsernamePasswordInput {
  @Field()
  username: string;

  @Field()
  email: string;

  @Field()
  password: string;
}
