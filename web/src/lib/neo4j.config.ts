import neo4j from 'neo4j-driver'

const NEO4J_URI = process.env.NEO4J_URI
const NEO4J_USERNAME = process.env.NEO4J_USERNAME
const NEO4J_PASSWORD = process.env.NEO4J_PASSWORD

export const driver = neo4j.driver(
   NEO4J_URI,
   neo4j.auth.basic(NEO4J_USERNAME, NEO4J_PASSWORD)
)

export default driver.session()
