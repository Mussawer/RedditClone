
import { ObjectType, Field } from "type-graphql";
import { BaseEntity, Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Post } from "./Post";

//for type-graphql 
@ObjectType()
//refers to a table in db for ORM
@Entity()
export class User extends BaseEntity {

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
  @Column({unique: true})
  username!: string;

  @Field()
  @Column({unique: true})
  email!: string;

  @Column()
  password!: string;

  @OneToMany(() => Post, (post) => post.creator)
  posts: Post[];
}