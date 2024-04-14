import { err } from "@config/error"
import { neoStart } from "@config/neo4j.config"
import { Session } from "neo4j-driver"

export const keepAliveNeo = (): Promise<null> => {
   return new Promise(async (resolve, reject) => {
      try {
         const neo4j: Session = neoStart()
         const query = "MATCH (c:Cron) RETURN c"
         const result = await neo4j.executeRead(tx => tx.run(query))
         const node = result.records.map(row => row.get("c"))

         if (node[0])
            resolve(null)
         else reject(err("server/driver-not-found"))
      } catch { reject(err("server/driver-not-found")) }
   })
}
