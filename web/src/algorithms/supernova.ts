import neo4j from '@config/neo4j.config'

export const supernova = async (user: string): Promise<string> => {

   //DEFINING THE VARIABELS NEEDED TO WORK
   let startingPoint: string | undefined = user
   let friendList: Map<string, number> = new Map()
   let arrayFriends: Array<string> = []
   let friendListSearched: Array<string | undefined> = []
   let alreadySearched: Array<string | undefined> = []
   let friend: string = ""
   let startingPointInterests: Array<string> = []
   let arrayInterests: Array<string> = []

   let queryStartingPoint = `MATCH (u:User) WHERE u.name = "${startingPoint}" RETURN u`
   let queryFriends = `MATCH (u:User)-[:Friend]-(t:User) WHERE u.name = "${startingPoint}" RETURN t`

   //TODO: COMMENTA TUTTO SENNò NON CI CAPISCI NA SEGA
   return new Promise<string>(async (resolve, reject) => {
      if (neo4j) {
         const resultStartingPoint = await neo4j.executeRead(tx => tx.run(queryStartingPoint))
         const startingNode = resultStartingPoint.records.map(row => row.get('u'))
         //Salvo gli interessi del nodo di partenza
         startingPointInterests = startingNode.at(0).properties["interests"]

         const result = await neo4j.executeRead(tx => tx.run(queryFriends))
         let results = result.records.map(row => row.get('t'))
         results.forEach(element => {
            //console.log(element.properties["interests"])
            arrayInterests = []
            if (element.properties["interests"] !== undefined) {
               let interests: string = element.properties["interests"]
               let cleanInput = interests.slice(1, -1)
               arrayInterests = cleanInput.split(",")
            }
            //Setto tutta la mappa con il nome del nodo e la loro compatibilità con il nodo principale
            friendList.set(element.properties["name"], checkInterestsCompatibility(startingPointInterests, arrayInterests))
         });
         arrayFriends = sortFriendsMap(friendList)

         //itera finchè troverà amici collegati a quella persona, quando finisce esce dal ciclo senza restituire niente
         while (friendList.size > 0) {
            //controlla se quella persona è già stata trovata dentro all'algoritmo almeno una volta, in caso negativo la aggiunge, in caso positivo salta all'amico dopo
            if (!friendListSearched.includes(arrayFriends[0])) {
               friendList.delete(arrayFriends[0])
               startingPoint = arrayFriends.shift()
               friendListSearched.push(startingPoint)
            } else continue
            //QUERY PER GLI AMICI, restituisce tutti gli amici dell'utente U che avrà nome startingPoint
            queryFriends = `MATCH (u:User)-[:Friend]-(t:User) WHERE u.name = "${startingPoint}" RETURN t`
            const result1 = await neo4j.executeRead(tx => tx.run(queryFriends))
            results = result1.records.map(row => row.get('t'))
            //TODO : Non mi sembra ancora scalabile, potrei semplicemente essere stanco, è da ricontrollare

            //Itera attraverso tutti gli amici che sono stati trovati per quell'utente
            for await (let element of results) {
               friend = element.properties["name"]
               //Se quell'amico è già stato cercato una volta allora salterà quell'iterazione
               if (alreadySearched.includes(friend)) continue
               //QUERY PER VEDERE SE SONO GIà AMICI ( ovviamente salta se è se stesso dato che non può essere amico di se stesso )
               if (user != friend) {
                  const queryAlreadyFriend = `OPTIONAL MATCH (u:User)-[:Friend]-(t:User) WHERE u.name="${user}" AND t.name="${friend}" RETURN t`
                  const result = await neo4j?.executeRead(tx => tx.run(queryAlreadyFriend))
                  let testNull = result.records.map(row => row.get('t'))
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
      }
      reject(new Error("Internal Server Error"))
   })



}
//Controlla quanti interessi sono uguali tra il nodo di partenza e quello dell'amico da ricercare
const checkInterestsCompatibility = (startingNode: Array<string>, friendToBeChecked: Array<string>) => {
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
//Questa funzione ritorna un array di stringhe sortato in base al numero associato alla stringa nella mappa
const sortFriendsMap = (friendsMap: Map<string, number>) => {
   let temp: Array<string> = []
   let tempNumbers: Array<number> = []

   friendsMap.forEach(check)
   //Controlla se per ogni valore presente nella mappa trova un valore maggiore del suo, in caso negativo mette la stringa al primo posto e aggiunge all'array temporaneo il valore al primo posto, se sarà il valore minore lo mette in coda all'array temporaneo, se non è ne il minore ne il maggiore allora trova l'indice del valore maggiore del suo e si metterà al suo posto shiftando tutto l'array dopo di lui
   function check(value: number, key: string, map: Map<string, number>) {
      //TODO: FIXA L'ORDINE DI STA MERDA
      if (value <= Math.max(...tempNumbers)) {
         tempNumbers.push(value)
         temp.push(key)
      } else if (value >= Math.min(...tempNumbers)) {
         tempNumbers[0] = value
         temp[0] = key
      } else {
         if (tempNumbers.length > 0) {
            let greaterNumberIndex: number = tempNumbers.findIndex((element) => element >= value)
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
   return temp
}

function shiftArrays(tempNumbers: Array<number>, temp: Array<string>, index: number) {
   for (let i = temp.length; i >= index; i--) {
      tempNumbers[i + 1] = tempNumbers[i]
      temp[i + 1] = temp[i]
   }
}
