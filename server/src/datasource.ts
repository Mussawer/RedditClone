import { DataSource } from "typeorm";
import { __prod__ } from "./constants";
import path from "path";
import { Vote } from "./entities/Vote";
import { User } from "./entities/User";
import { Post } from "./entities/Post";

const dataSource = new DataSource({
  type: "postgres",
  database: "redditClone2",
  username: "postgres",
  password: "postgres",
  logging: true,
  synchronize: true,
  migrations: [path.join(__dirname, "./migrations/*")],
  entities: [Post, User, Vote],
  port:5433
  //   migrationsTableName: "migrations",
});

export default dataSource;
