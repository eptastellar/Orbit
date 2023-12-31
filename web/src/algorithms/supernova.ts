import neo4j from '../lib/neo4j.config'

export const supernova = async (user: string) => {

   //DEFINING THE VARIABELS NEEDED TO WORK
   let startingPoint: string | undefined = user
   let friendList: Array<string> = []
   let friendListSearched: Array<string | undefined> = []
   let alreadySearched: Array<string | undefined> = []
   let friend: string | undefined = ""

   let queryFriends = `MATCH (u:User)-[:Friend]-(t:User) WHERE u.name = "${startingPoint}" RETURN t`

   //TODO: COMMENTA TUTTO SENNò NON CI CAPISCI NA SEGA
   if (neo4j) {
      const result = await neo4j.executeRead(tx => tx.run(queryFriends))
      let results = result.records.map(row => row.get('t'))
      results.forEach(element => {
         friendList.push(element.properties["name"])
      });

      //itera finchè troverà amici collegati a quella persona, quando finisce esce dal ciclo senza restituire niente
      while (friendList.length > 0) {
         //controlla se quella persona è già stata trovata dentro all'algoritmo almeno una volta, in caso negativo la aggiunge, in caso positivo salta all'amico dopo
         if (!friendListSearched.includes(friendList[0])) {
            startingPoint = friendList.shift()
            friendListSearched.push(startingPoint)
         } else continue
         //QUERY PER GLI AMICI, restituisce tutti gli amici dell'utente U che avrà nome startingPoint
         queryFriends = `MATCH (u:User)-[:Friend]-(t:User) WHERE u.name = "${startingPoint}" RETURN t`
         const result1 = await neo4j.executeRead(tx => tx.run(queryFriends))
         results = result1.records.map(row => row.get('t'))

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
                  console.log(friend)
                  return friend
               }
               //aggiunge alla lista di persone già cercate per ottimizzare l'algoritmo
               alreadySearched.push(friend)
            }

         }
      }
   }

}
