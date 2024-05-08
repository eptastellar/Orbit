import { MeteorAlgorithm } from "algorithms"
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
               return resolve(successResponse)
            }
            else return reject(err("server/driver-not-found"))
         } catch { return reject(err("server/driver-not-found")) }
      })
   }

   public meteorAlgorithm = (): Promise<SuccessResponse> => {
      return new Promise(async (resolve, reject) => {
         try {
            neo().executeRead(tx => tx.run("MATCH (u:User) RETURN u.name AS uid")).then(async (result) => {
               result.records.map(async (record) => {
                  const Meteor = new MeteorAlgorithm()
                  const uid: string = record.get("uid")
                  const friend: string = await Meteor.Meteor(uid)
                  console.log(friend, "is the friend of", uid)
                  return resolve({ success: true })
               })
            })
         } catch { return reject(err("server/meteor-algorithm-failed")) }
      })
   }
}
