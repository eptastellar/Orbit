import dotenv from 'dotenv';
import neo4j, { Driver, Session } from 'neo4j-driver';

dotenv.config()

const NEO4J_URI = process.env.NEO4J_URI;
const NEO4J_USERNAME = process.env.NEO4J_USERNAME;
const NEO4J_PASSWORD = process.env.NEO4J_PASSWORD;

let driver: Driver | null = null;
let session: Session | null = null;
if (NEO4J_URI && NEO4J_USERNAME && NEO4J_PASSWORD) {
   driver = neo4j.driver(
      NEO4J_URI,
      neo4j.auth.basic(NEO4J_USERNAME, NEO4J_PASSWORD)
   );

   session = driver.session();
}

export default session;
