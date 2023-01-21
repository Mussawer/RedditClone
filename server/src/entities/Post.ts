
import { ObjectType, Field } from "type-graphql";
import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "./User";

//for type-graphql
@ObjectType()
//refers to a table in db for ORM
@Entity()
export class Post extends BaseEntity {

  @Field()
  //corresponds to primary key in db
  @PrimaryGeneratedColumn()
  _id!: number;

  @Field(() => String)
  //corresponds to column in db if decorator removed it will not be a db column
  @CreateDateColumn()
  createdAt?: Date;
  
  @Field(() => String)
  @UpdateDateColumn()// a hook that will create a new date everytime we update
  updatedAt?: Date;

  @Field()
  @Column()
  title!: string;

  @Field()
  @Column()
  creatorId: number;

  @Field()
  @ManyToOne(() => User, (user) => user.posts)
  creator: User;

  @Field()
  @Column()
  text!: string;

  @Field()
  @Column({ type: "int", default: 0 })
  points!: number;

}