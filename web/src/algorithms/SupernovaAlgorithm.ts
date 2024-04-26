import { err, neo } from "config"
import { QueryResult } from "neo4j-driver"
import { SupernovaResponse } from "types"

export class SupernovaAlgorithm {
   constructor() { }

   public supernova = async (user: string): Promise<string> => {
      let startingPoint: string | undefined = user
      const friendList: Map<string, number> = new Map()
      let arrayFriends: Array<string> = []
      const friendListSearched: Array<string | undefined> = []
      const alreadySearched: Array<string | undefined> = []
      let startingPointInterests: Array<string> = []
      let arrayInterests: Array<string> = []
      let result: QueryResult

      //query to retrieve the starting user node
      const queryStartingPoint: string = `OPTIONAL MATCH (u:User) WHERE u.name = "${startingPoint}" RETURN u`
      //query to find friends connected to the starting user node
      let queryFriends: string = `OPTIONAL MATCH (u:User)-[:Friend]-(t:User) WHERE u.name = "${startingPoint}" RETURN t`

      return new Promise<string>(async (resolve, reject) => {
         //retrieve the starting user node and its interests
         const resultStartingPoint: QueryResult = await neo().executeRead(tx => tx.run(queryStartingPoint))
         const startingNode = resultStartingPoint.records.map(row => row.get("u"))
         if (startingNode.includes(null)) {
            return reject(err("User not found"))
         }
         startingPointInterests = this.stringSlicing(startingNode.at(0).properties["interests"])

         //retrieve friends of the starting user and calculate compatibility
         result = await neo().executeRead(tx => tx.run(queryFriends))
         let results = result.records.map(row => row.get("t"))
         if (results.includes(null)) {
            return reject(err("No Friends Found"))
         }
         results.forEach(element => {
            friendList.set(element.properties["name"], 0)
            arrayFriends.push(element.properties["name"])
         })

         //explore the network of friends until a suitable match is found
         while (friendList.size > 0) {
            //TODO fixa i commenti
            //controlla se quella persona è già stata trovata dentro all'algoritmo almeno una volta, in caso negativo la aggiunge, in caso positivo salta all'amico dopo
            if (!friendListSearched.includes(arrayFriends[0])) {
               friendList.delete(arrayFriends[0])
               startingPoint = arrayFriends.shift()
               friendListSearched.push(startingPoint)
            } else continue

            queryFriends = `MATCH (u:User)-[:Friend]-(t:User) WHERE u.name = "${startingPoint}" RETURN t`
            result = await neo().executeRead(tx => tx.run(queryFriends))
            results = result.records.map(row => row.get("t"))

            results.forEach(element => {
               arrayInterests = this.stringSlicing(element.properties["interests"])
               friendList.set(element.properties["name"], this.checkInterestsCompatibility(startingPointInterests, arrayInterests))
            })
            arrayFriends = this.sortFriendsMap(friendList)
            //Itera attraverso tutti gli amici che sono stati trovati per quell'utente
            for await (const friend of arrayFriends) {
               //Se quell'amico è già stato cercato una volta allora salterà quell'iterazione
               if (alreadySearched.includes(friend)) continue
               //QUERY PER VEDERE SE SONO GIà AMICI ( ovviamente salta se è se stesso dato che non può essere amico di se stesso )
               if (user != friend) {
                  const queryAlreadyFriend = `OPTIONAL MATCH (u:User)-[:Friend]-(t:User) WHERE u.name="${user}" AND t.name="${friend}" RETURN t`
                  result = await neo()?.executeRead(tx => tx.run(queryAlreadyFriend))
                  const testNull = result.records.map(row => row.get("t"))
                  //Ritorna quando testNull[0] è null dato che l'optional match risponde con NULL solamente quando non trova il match tra le persone, ma se abbiamo controllato esattamente che quelle persone esistono e non hanno una connessione allora vuol dire che abbiamo un match
                  if (testNull[0] === null) {
                     return resolve(friend)
                  }
                  //aggiunge alla lista di persone già cercate per ottimizzare l'algoritmo
                  alreadySearched.push(friend)
               }
            }
         }
         return reject(err("Impossible to find new friends"))
      })
   }

   //calculate the number of shared interests between two users
   public checkInterestsCompatibility = (startingNode: Array<string>, friendToBeChecked: Array<string>) => {
      let compatibility: number = 0
      if (friendToBeChecked == undefined) friendToBeChecked = [""]
      startingNode.forEach(element => {
         if (typeof (friendToBeChecked) === "string") {
            if (element === friendToBeChecked) compatibility++
         } else {
            if (friendToBeChecked.some((string) => string === element)) compatibility++
         }
      })
      return compatibility
   }

   //sort friends by compatibility score in descending order
   public sortFriendsMap = (friendsMap: Map<string, number>) => {
      const temp: Array<string> = []
      const tempNumbers: Array<number> = []

      //sort the map entries based on their associated numeric values
      const check = (value: number, key: string) => {
         if (value <= Math.max(...tempNumbers)) {
            tempNumbers.push(value)
            temp.push(key)
         } else if (value >= Math.min(...tempNumbers)) {
            tempNumbers[0] = value
            temp[0] = key
         } else {
            if (tempNumbers.length > 0) {
               const greaterNumberIndex: number = tempNumbers.findIndex((element) => element >= value)
               this.shiftArrays(tempNumbers, temp, greaterNumberIndex)
               tempNumbers[greaterNumberIndex] = value
               temp[greaterNumberIndex] = key
            } else {
               tempNumbers[0] = value
               temp[0] = key
            }
         }
      }

      friendsMap.forEach(check)
      return temp
   }

   //shift array elements to insert a new value at the given index
   public shiftArrays = (tempNumbers: Array<number>, temp: Array<string>, index: number) => {
      for (let i = temp.length; i >= index; i--) {
         tempNumbers[i + 1] = tempNumbers[i]
         temp[i + 1] = temp[i]
      }
   }

   public stringSlicing = (interestsString: string): Array<string> => {
      let arrayInterests: Array<string> = []
      if (interestsString !== undefined) {
         arrayInterests = interestsString.split(",")
      }
      return arrayInterests
   }

   //Setta l'amicizia tramite la funzione di supernova, deve essere chiamata solamente dal cron job
   public setSupernovaFriendship = (username: string): Promise<string> => {
      return new Promise(async (resolve, reject) => {
         this.supernova(username).then(async (string: string) => {
            const friendUsername = string
            const querySupernovaBinding: string = `MATCH (u:User {name : "${username}"}), (t:User {name : "${friendUsername}"}) MERGE (u)-[r:supernovaBind]-(t) SET r.time = ${Date.now()}`

            const result: QueryResult = await neo().executeWrite(tx => tx.run(querySupernovaBinding))
            const relationshipCode: string[] = result.records.map((row: any) => row.get("r.id"))
            return resolve(relationshipCode[0])
         }).catch((error) => { return reject(error) })
      })
   }

   //Controlla lo stato dell'amicizia supernova, se nessuno dei due ha accettato l'amicizia, se uno solo ha accettato l'amicizia o se uno dei due l'ha rifiutata
   public checkSupernovaFriendship = (username: string): Promise<SupernovaResponse> => {
      return new Promise(async (resolve, reject) => {
         const querySupernovaBinding: string = `OPTIONAL MATCH (u:User {name : "${username}"})-[r:supernovaBind]-(t:User) RETURN t.name,r UNION OPTIONAL MATCH (u:User {name : "${username}"})-[r:oneWaysupernovaBind]-(t:User) RETURN t.name,r UNION OPTIONAL MATCH (u:User {name : "${username}"})-[r:RefusedsupernovaBind]-(t:User) RETURN t.name,r`

         const resultFriend: QueryResult = await neo().executeRead(tx => tx.run(querySupernovaBinding))
         let friendName: string = ""
         let status: any = ""
         let oneway: string = ""

         resultFriend.records.forEach(record => {
            if (record.get("t.name") != null) {
               friendName = record.get("t.name")
               status = record.get("r")
               oneway = status.properties["oneway"]
            }
         })
         if (status.type === "" || undefined) //TODO need fix
            return reject(err("No binding found"))

         if (friendName == "") {
            return reject(err("No Supernova")) //This is given when there is no supernova associated at the user
         } else {
            const returnValue: SupernovaResponse = { username: friendName, status: status.type, oneway: oneway }
            return resolve(returnValue)
         }
      })
   }

   public oneWaySupernovaFriendship = (username: string, supernovaState: SupernovaResponse, accepted: boolean): Promise<string> => {
      return new Promise(async (res, rej) => { //TODO need fix
         if (supernovaState.status === "supernovaBind" && accepted === true) { // Se è stato trovato il binding di supernova e lo accetto
            const querySupernovaOneWaySetter: string = `MATCH (u:User {name : "${supernovaState.username}"})-[r:supernovaBind]-(t:User) DELETE r MERGE (u)-[d:oneWaysupernovaBind]-(t) SET d.oneway = "${username}"`
            await neo().executeWrite(tx => tx.run(querySupernovaOneWaySetter))
            return res("One way Binding Created")
         } else if (supernovaState.status === "oneWaysupernovaBind" && supernovaState.oneway === username) { // Se trovo che ho già accettato la supernova
            return rej(err("Already accepted friendship"))
         } else if (supernovaState.status === "refusedSupernova") { // Se trovo la relazione rifiutata
            return rej(err("Refused Supernova"))
         } else if (supernovaState.status === "oneWaysupernovaBind" && supernovaState.oneway != username && accepted) { // Se trovo che è già stato accettato il supernova dall'altra persona
            const queryFriendshipCreated: string = `MATCH (u:User {name : "${supernovaState.username}"})-[r:oneWaysupernovaBind]-(t:User) DELETE r MERGE (u)-[:Friend]-(t)`
            await neo().executeWrite(tx => tx.run(queryFriendshipCreated))
            return res("Friendship Created")
         } else if (supernovaState.status === "oneWaysupernovaBind" && supernovaState.oneway != username && !accepted) { // Se è già stata accettata la supernova e non sono io e la rifiuto
            const queryFriendshipCreated: string = `MATCH (u:User {name : "${supernovaState.username}"})-[r:oneWaysupernovaBind]-(t:User) DELETE r MERGE (u)-[:refusedSupernova]-(t)`
            await neo().executeWrite(tx => tx.run(queryFriendshipCreated))
            return res("Supernova Blocked")
         } else if (supernovaState.status === "supernovaBind" && !accepted) { // Se è stato creato un supernova binding e non lo accetto
            const queryFriendshipCreated: string = `MATCH (u:User {name : "${supernovaState.username}"})-[r:oneWaysupernovaBind]-(t:User) DELETE r MERGE (u)-[:refusedSupernova]-(t)`
            await neo().executeWrite(tx => tx.run(queryFriendshipCreated))
            return res("Supernova Blocked")
         }
      })
   }

}
