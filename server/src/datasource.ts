import { DataSource } from "typeorm";
import { __prod__ } from "./constants";
import path from "path";
import { Vote } from "./entities/Vote";
import { User } from "./entities/User";
import { Post } from "./entities/Post";

const dataSource = new DataSource({
  type: "postgres",
  // database: "uchepptx",
  // username: "uchepptx",
  // password: "Uckzb1W-3YuQhn1ehO9kzsXsTWhIILNl",
  // url:"postgres://uchepptx:Uckzb1W-3YuQhn1ehO9kzsXsTWhIILNl@kashin.db.elephantsql.com/uchepptx",
  database: "redditClone2",
  username: "postgres",
  password: "postgres",
  logging: true,
  synchronize: true,
  // host:"kashin.db.elephantsql.com",
  migrations: [path.join(__dirname, "./migrations/*")],
  entities: [Post, User, Vote],
  // port:5432,
  port:5433,
  // extra: {
  //   max: 1, // set pool max size
  // }
  //   migrationsTableName: "migrations",
});

export default dataSource;
