import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { ObjectType, Field } from "type-graphql";

//for type-graphql
@ObjectType()
//refers to a table in db for ORM
@Entity()
export class Post {

  @Field()
  //corresponds to primary key in db
  @PrimaryKey()
  _id!: number;

  @Field(() => String)
  //corresponds to column in db if decorator removed it will not be a db column
  @Property()
  createdAt?: Date = new Date();
  
  @Field(() => String)
  @Property({ type: "date", onUpdate: () => new Date() })// a hook that will create a new date everytime we update
  updatedAt?: Date = new Date();

  @Field()
  @Property({type: "text"})
  title!: string;
}