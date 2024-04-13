import { neo } from "config"
import { Session } from "neo4j-driver"

export const supernova = async (user: string): Promise<string> => {
   const neo4j: Session = neo() //TODO: @TheInfernalNick add neoClose for each transaction
   let startingPoint: string | undefined = user
   const friendList: Map<string, number> = new Map()
   let arrayFriends: Array<string> = []
   const friendListSearched: Array<string | undefined> = []
   const alreadySearched: Array<string | undefined> = []
   let friend: string = ""
   let startingPointInterests: Array<string> = []
   let arrayInterests: Array<string> = []

   //query to retrieve the starting user node
   const queryStartingPoint = `MATCH (u:User) WHERE u.name = "${startingPoint}" RETURN u`
   //query to find friends connected to the starting user node
   let queryFriends = `MATCH (u:User)-[:Friend]-(t:User) WHERE u.name = "${startingPoint}" RETURN t`

   return new Promise<string>(async (resolve, reject) => {
      //retrieve the starting user node and its interests
      const resultStartingPoint = await neo4j.executeRead(tx => tx.run(queryStartingPoint))
      const startingNode = resultStartingPoint.records.map(row => row.get("u"))
      startingPointInterests = stringSlicing(startingNode.at(0).properties["interests"])

      //retrieve friends of the starting user and calculate compatibility
      const result = await neo4j.executeRead(tx => tx.run(queryFriends))
      let results = result.records.map(row => row.get("t"))
      results.forEach(element => {
         arrayInterests = stringSlicing(element.properties["interests"])
         friendList.set(element.properties["name"], checkInterestsCompatibility(startingPointInterests, arrayInterests))
      })
      arrayFriends = sortFriendsMap(friendList)

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
         const result1 = await neo4j.executeRead(tx => tx.run(queryFriends))
         results = result1.records.map(row => row.get("t"))
         //TODO : Non mi sembra ancora scalabile, è da ricontrollare

         //Itera attraverso tutti gli amici che sono stati trovati per quell'utente
         for await (const element of results) {
            friend = element.properties["name"]
            //Se quell'amico è già stato cercato una volta allora salterà quell'iterazione
            if (alreadySearched.includes(friend)) continue
            //QUERY PER VEDERE SE SONO GIà AMICI ( ovviamente salta se è se stesso dato che non può essere amico di se stesso )
            if (user != friend) {
               const queryAlreadyFriend = `OPTIONAL MATCH (u:User)-[:Friend]-(t:User) WHERE u.name="${user}" AND t.name="${friend}" RETURN t`
               const result = await neo4j?.executeRead(tx => tx.run(queryAlreadyFriend))
               const testNull = result.records.map(row => row.get("t"))
               //Ritorna quando testNull[0] è null dato che l'optional match risponde con NULL solamente quando non trova il match tra le persone, ma se abbiamo controllato esattamente che quelle persone esistono e non hanno una connessione allora vuol dire che abbiamo un match
               if (testNull[0] === null) {
                  resolve(friend)
               }
               //aggiunge alla lista di persone già cercate per ottimizzare l'algoritmo
               alreadySearched.push(friend)
            }
         }
      }
      reject(new Error("Not Found"))
   })
}

//calculate the number of shared interests between two users
const checkInterestsCompatibility = (startingNode: Array<string>, friendToBeChecked: Array<string>) => {
   let compatibility: number = 0
   if (friendToBeChecked == undefined) friendToBeChecked = [""]
   console.log(startingNode)
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
const sortFriendsMap = (friendsMap: Map<string, number>) => {
   const temp: Array<string> = []
   const tempNumbers: Array<number> = []

   //sort the map entries based on their associated numeric values
   const check = (value: number, key: string) => {
      //TODO: FIXA L'ORDINE
      if (value <= Math.max(...tempNumbers)) {
         tempNumbers.push(value)
         temp.push(key)
      } else if (value >= Math.min(...tempNumbers)) {
         tempNumbers[0] = value
         temp[0] = key
      } else {
         if (tempNumbers.length > 0) {
            const greaterNumberIndex: number = tempNumbers.findIndex((element) => element >= value)
            //TODO: Potrebbbe non funzionare, controllare in futuro con dei test case
            shiftArrays(tempNumbers, temp, greaterNumberIndex)
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
const shiftArrays = (tempNumbers: Array<number>, temp: Array<string>, index: number) => {
   for (let i = temp.length; i >= index; i--) {
      tempNumbers[i + 1] = tempNumbers[i]
      temp[i + 1] = temp[i]
   }
}

const stringSlicing = (interestsString: string): Array<string> => {
   let arrayInterests: Array<string> = []
   if (interestsString !== undefined) {
      arrayInterests = interestsString.split(",")
   }
   return arrayInterests
}
