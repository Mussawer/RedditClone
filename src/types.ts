import { EntityManager, IDatabaseDriver, Connection } from "@mikro-orm/core"

export type MyContext {
    fork: EntityManager<IDatabaseDriver<Connection>>
}