import { neo } from '@config/neo4j.config'
import { Session } from 'neo4j-driver'

const neo4j: Session = neo()

export async function keepAliveNeo(): Promise<null> {
   return new Promise(async (resolve, reject) => {
      try {
         const query = 'MATCH (c:Cron) RETURN c'
         const result = await neo4j.executeRead(tx => tx.run(query))
         const node = result.records.map(row => row.get('c'))

         if (node[0])
            resolve(null)
         else reject(new Error('server/driver-not-found'))
      } catch (error) { reject(new Error('server/driver-not-found')) }
   })
}
