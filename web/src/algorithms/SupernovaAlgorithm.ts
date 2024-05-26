import { ErrorsService } from '@/common';
import { Neo4jModule } from '@/config';
import { ManagedTransaction, QueryResult, RecordShape } from 'neo4j-driver';

export class SupernovaAlgorithm {
  private neo4j: Neo4jModule;
  private error: ErrorsService;

  constructor() {
    this.neo4j = new Neo4jModule();
    this.error = new ErrorsService();
  }

  public supernova = async (user: string): Promise<string> => {
    let startingPoint: string | undefined = user;
    const friendList: Map<string, number> = new Map();
    let arrayFriends: Array<string> = [];
    const friendListSearched: Array<string | undefined> = [];
    const alreadySearched: Array<string | undefined> = [];
    let startingPointInterests: Array<string> = [];
    let arrayInterests: Array<string> = [];
    let result: QueryResult;

    //query to retrieve the starting user node
    const queryStartingPoint: string = `OPTIONAL MATCH (u:User) WHERE u.name = "${startingPoint}" RETURN u`;
    //query to find friends connected to the starting user node
    let queryFriends: string = `OPTIONAL MATCH (u:User)-[:Friend]-(t:User) WHERE u.name = "${startingPoint}" RETURN t`;

    return new Promise<string>(async (resolve, reject) => {
      //retrieve the starting user node and its interests
      const resultStartingPoint: QueryResult = await this.neo4j
        .neo()
        .executeRead((tx: ManagedTransaction) => tx.run(queryStartingPoint));
      const startingNode = resultStartingPoint.records.map((row) =>
        row.get('u'),
      );
      if (startingNode.includes(null)) {
        return reject(this.error.e('User not found'));
      }
      startingPointInterests = this.stringSlicing(
        startingNode.at(0).properties['interests'],
      );

      //retrieve friends of the starting user and calculate compatibility
      result = await this.neo4j
        .neo()
        .executeRead((tx: ManagedTransaction) => tx.run(queryFriends));
      let results: RecordShape = result.records.map((row) => row.get('t'));
      if (results.includes(null)) {
        return reject(this.error.e('No Friends Found'));
      }
      results.forEach((element: RecordShape) => {
        friendList.set(element.properties['name'], 0);
        arrayFriends.push(element.properties['name']);
      });

      //explore the network of friends until a suitable match is found
      while (friendList.size > 0) {
        //TODO fixa i commenti
        //controlla se quella persona è già stata trovata dentro all'algoritmo almeno una volta, in caso negativo la aggiunge, in caso positivo salta all'amico dopo
        if (!friendListSearched.includes(arrayFriends[0])) {
          friendList.delete(arrayFriends[0]);
          startingPoint = arrayFriends.shift();
          friendListSearched.push(startingPoint);
        } else continue;

        queryFriends = `MATCH (u:User)-[:Friend]-(t:User) WHERE u.name = "${startingPoint}" RETURN t`;
        result = await this.neo4j
          .neo()
          .executeRead((tx: ManagedTransaction) => tx.run(queryFriends));
        results = result.records.map((row) => row.get('t'));

        results.forEach((element: RecordShape) => {
          arrayInterests = this.stringSlicing(element.properties['interests']);
          friendList.set(
            element.properties['name'],
            this.checkInterestsCompatibility(
              startingPointInterests,
              arrayInterests,
            ),
          );
        });
        arrayFriends = this.sortFriendsMap(friendList);
        //Itera attraverso tutti gli amici che sono stati trovati per quell'utente
        for await (const friend of arrayFriends) {
          //Se quell'amico è già stato cercato una volta allora salterà quell'iterazione
          if (alreadySearched.includes(friend)) continue;
          //QUERY PER VEDERE SE SONO GIà AMICI ( ovviamente salta se è se stesso dato che non può essere amico di se stesso )
          if (user != friend) {
            const queryAlreadyFriend: string = `OPTIONAL MATCH (u:User)-[:Friend]-(t:User) WHERE u.name="${user}" AND t.name="${friend}" RETURN t`;
            result = await this.neo4j
              .neo()
              .executeRead((tx) => tx.run(queryAlreadyFriend));
            const testNull: RecordShape = result.records.map((row) =>
              row.get('t'),
            );
            //Ritorna quando testNull[0] è null dato che l'optional match risponde con NULL solamente quando non trova il match tra le persone, ma se abbiamo controllato esattamente che quelle persone esistono e non hanno una connessione allora vuol dire che abbiamo un match
            if (testNull[0] === null) {
              return resolve(friend);
            }
            //aggiunge alla lista di persone già cercate per ottimizzare l'algoritmo
            alreadySearched.push(friend);
          }
        }
      }
      return reject(this.error.e('Impossible to find new friends'));
    });
  };

  //calculate the number of shared interests between two users
  private checkInterestsCompatibility = (
    startingNode: Array<string>,
    friendToBeChecked: Array<string>,
  ) => {
    let compatibility: number = 0;
    if (friendToBeChecked == undefined) friendToBeChecked = [''];
    startingNode.forEach((element: string) => {
      if (typeof friendToBeChecked === 'string') {
        if (element === friendToBeChecked) compatibility++;
      } else {
        if (friendToBeChecked.some((string) => string === element))
          compatibility++;
      }
    });
    return compatibility;
  };

  //sort friends by compatibility score in descending order
  private sortFriendsMap = (friendsMap: Map<string, number>) => {
    const temp: Array<string> = [];
    const tempNumbers: Array<number> = [];

    //sort the map entries based on their associated numeric values
    const check = (value: number, key: string) => {
      if (value <= Math.max(...tempNumbers)) {
        tempNumbers.push(value);
        temp.push(key);
      } else if (value >= Math.min(...tempNumbers)) {
        tempNumbers[0] = value;
        temp[0] = key;
      } else {
        if (tempNumbers.length > 0) {
          const greaterNumberIndex: number = tempNumbers.findIndex(
            (element) => element >= value,
          );
          this.shiftArrays(tempNumbers, temp, greaterNumberIndex);
          tempNumbers[greaterNumberIndex] = value;
          temp[greaterNumberIndex] = key;
        } else {
          tempNumbers[0] = value;
          temp[0] = key;
        }
      }
    };

    friendsMap.forEach(check);
    return temp;
  };

  //shift array elements to insert a new value at the given index
  private shiftArrays = (
    tempNumbers: Array<number>,
    temp: Array<string>,
    index: number,
  ) => {
    for (let i = temp.length; i >= index; i--) {
      tempNumbers[i + 1] = tempNumbers[i];
      temp[i + 1] = temp[i];
    }
  };

  private stringSlicing = (interestsString: string): Array<string> => {
    let arrayInterests: Array<string> = [];
    if (interestsString !== undefined) {
      arrayInterests = interestsString.split(',');
    }
    return arrayInterests;
  };
}
