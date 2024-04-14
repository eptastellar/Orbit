import dotenv from "dotenv"
import neo4j, { Driver, Session } from "neo4j-driver"

dotenv.config()

const NEO4J_URI: string = process.env.NEO4J_URI!
const NEO4J_USERNAME: string = process.env.NEO4J_USERNAME!
const NEO4J_PASSWORD: string = process.env.NEO4J_PASSWORD!

const driver: Driver = neo4j.driver(
   NEO4J_URI,
   neo4j.auth.basic(NEO4J_USERNAME, NEO4J_PASSWORD)
)

export const neoStart = (): Session => { return driver.session() }
export const neoClose = (): void => { driver.close() }
