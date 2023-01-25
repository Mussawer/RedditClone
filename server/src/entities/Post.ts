
import { ObjectType, Field, Int } from "type-graphql";
import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Vote } from "./Vote";
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

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.posts)
  creator: User;

  @Field(() => Int, { nullable: true })
  voteStatus: number | null; // 1 or -1 or null

  @OneToMany(() => Vote, (vote) => vote.post)
  vote: Vote[];

  @Field()
  @Column()
  text!: string;

  @Field()
  @Column({ type: "int", default: 0 })
  points!: number;

}