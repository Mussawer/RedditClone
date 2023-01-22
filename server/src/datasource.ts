import { DataSource } from "typeorm";
import { __prod__ } from "./constants";
import path from "path"

const dataSource = new DataSource({
  entities: ["dist/entities/*js"], // path to our JS entities (dist), relative to `baseDir`
  database: "redditClone2",
  username: "postgres",
  password: "postgres",
  type: "postgres",
  logging: !__prod__,
  synchronize: true,
  port: 5433,
  migrations: [path.join(__dirname, "./migrations/*")],
//   migrationsTableName: "migrations",
});

export default dataSource;
