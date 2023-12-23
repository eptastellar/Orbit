import neo4j from '../lib/neo4j.config'

export const supernova = async (user: string) => {
   let query = `MATCH (u:User) WHERE u.name = ${user} RETURN u`
   neo4j.run(query)
}
