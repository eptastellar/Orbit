import { err, neo } from "config"
import { Session } from "neo4j-driver"
import { SuccessResponse } from "types"

export default class CronJobsService {
   constructor() { }

   public keepAliveNeo = (): Promise<SuccessResponse> => {
      return new Promise(async (resolve, reject) => {
         try {
            const neo4j: Session = neo()
            const query = "MATCH (c:Cron) RETURN c"
            const result = await neo4j.executeRead(tx => tx.run(query))
            const node = result.records.map(row => row.get("c"))

            if (node[0]) {
               const successResponse: SuccessResponse = {
                  success: true
               }
               resolve(successResponse)
            }
            else reject(err("server/driver-not-found"))
         } catch { reject(err("server/driver-not-found")) }
      })
   }
}
