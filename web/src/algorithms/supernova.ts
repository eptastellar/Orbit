import neo4j from '@config/neo4j.config'

export const supernova = async (user: string) => {

   //DEFINING THE VARIABELS NEEDED TO WORK
   let startingPoint: string | undefined = user
   let friendList: Array<string> = []
   let alreadySearched: Array<string> = []
   let friend: string | undefined = ""

   let queryFriends = `MATCH (u:User)-[:Friend]-(t:User) WHERE u.name = "${startingPoint}" RETURN t`

   //TODO: COMMENTA TUTTO SENNò NON CI CAPISCI NA SEGA
   if (neo4j) {
      const result = await neo4j.executeRead(tx => tx.run(queryFriends))
      let results = result.records.map(row => row.get('t'))
      results.forEach(element => {
         friendList.push(element.properties["name"])
      });


      while (friendList.length > 0) {

         startingPoint = friendList.shift()
         //QUERY PER GLI AMICI
         queryFriends = `MATCH (u:User)-[:Friend]-(t:User) WHERE u.name = "${startingPoint}" RETURN t`

         const result1 = await neo4j.executeRead(tx => tx.run(queryFriends))
         results = result1.records.map(row => row.get('t'))

         for await (let element of results) {
            friend = element.properties["name"]
            //QUERY PER VEDERE SE SONO GIà AMICI
            const queryAlreadyFriend = `OPTIONAL MATCH (u:User)-[:Friend]-(t:User) WHERE u.name="${user}" AND t.name="${friend}" RETURN t`
            const result = await neo4j?.executeRead(tx => tx.run(queryAlreadyFriend))
            let testNull = result.records.map(row => row.get('t'))
            console.log(testNull[0])
            if (testNull[0] === null) {
               console.log(friend)
               return friend
            }
         }
      }
   }

}
