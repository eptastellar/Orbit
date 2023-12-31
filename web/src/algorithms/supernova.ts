import neo4j from '../lib/neo4j.config'

export const supernova = async (user: string) => {
   let query = `MATCH (u:User) WHERE u.name = ${user} RETURN u`
   if (neo4j) neo4j.run(query)
}
