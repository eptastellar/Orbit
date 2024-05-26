import { SupernovaAlgorithm } from '@/algorithms';
import { ErrorsService } from '@/common';
import { Neo4jModule } from '@/config';
import { SupernovaBind, SupernovaResponse } from '@/types';
import { Injectable } from '@nestjs/common';
import { QueryResult } from 'neo4j-driver';

@Injectable()
export class SupernovaService {
  private neo4j: Neo4jModule;
  private error: ErrorsService;

  constructor() {
    this.neo4j = new Neo4jModule();
    this.error = new ErrorsService();
  }

  //Setta l'amicizia tramite la funzione di supernova, deve essere chiamata solamente dal cron job
  public setSupernovaFriendship = (username: string): Promise<string> => {
    return new Promise(async (resolve, reject) => {
      new SupernovaAlgorithm()
        .supernova(username)
        .then(async (string: string) => {
          const friendUsername = string;
          const querySupernovaBinding: string = `MATCH (u:User {name : "${username}"}), (t:User {name : "${friendUsername}"}) MERGE (u)-[r:supernovaBind]-(t) SET r.time = ${Date.now()}`;

          const result: QueryResult = await this.neo4j
            .neo()
            .executeWrite((tx) => tx.run(querySupernovaBinding));
          const relationshipCode: string[] = result.records.map((row: any) =>
            row.get('r.id'),
          );
          return resolve(relationshipCode[0]);
        })
        .catch((error) => {
          return reject(error);
        });
    });
  };

  //Controlla lo stato dell'amicizia supernova, se nessuno dei due ha accettato l'amicizia, se uno solo ha accettato l'amicizia o se uno dei due l'ha rifiutata
  public checkSupernovaFriendship = (
    username: string,
  ): Promise<SupernovaResponse> => {
    return new Promise(async (resolve, reject) => {
      const querySupernovaBinding: string = `OPTIONAL MATCH (u:User {name : "${username}"})-[r:supernovaBind]-(t:User) RETURN t.name,r UNION OPTIONAL MATCH (u:User {name : "${username}"})-[r:oneWaysupernovaBind]-(t:User) RETURN t.name,r UNION OPTIONAL MATCH (u:User {name : "${username}"})-[r:RefusedsupernovaBind]-(t:User) RETURN t.name,r`;

      const resultFriend: QueryResult = await this.neo4j
        .neo()
        .executeRead((tx) => tx.run(querySupernovaBinding));
      let friendName: string = '';
      let status: any = '';
      let oneway: string = '';

      resultFriend.records.forEach((record) => {
        if (record.get('t.name') != null) {
          friendName = record.get('t.name');
          status = record.get('r');
          oneway = status.properties['oneway'];
        }
      });
      if (status.type === '' || undefined)
        return reject(this.error.e('server/no-binding-found'));

      if (friendName == '') {
        return reject(this.error.e('server/no-supernova')); //This is given when there is no supernova associated at the user
      } else {
        const returnValue: SupernovaResponse = {
          username: friendName,
          status: status.type,
          oneway: oneway,
        };
        return resolve(returnValue);
      }
    });
  };

  public oneWaySupernovaFriendship = (
    username: string,
    supernovaState: SupernovaResponse,
    accepted: boolean,
  ): Promise<SupernovaBind> => {
    return new Promise(async (res, rej) => {
      if (supernovaState.status === 'supernovaBind' && accepted === true) {
        // Se è stato trovato il binding di supernova e lo accetto
        const querySupernovaOneWaySetter: string = `MATCH (u:User {name : "${supernovaState.username}"})-[r:supernovaBind]-(t:User) DELETE r MERGE (u)-[d:oneWaysupernovaBind]-(t) SET d.oneway = "${username}"`;
        await this.neo4j
          .neo()
          .executeWrite((tx) => tx.run(querySupernovaOneWaySetter));
        const binding: SupernovaBind = { response: 'one-way-binding' };
        return res(binding);
      } else if (
        supernovaState.status === 'oneWaysupernovaBind' &&
        supernovaState.oneway === username
      ) {
        // Se trovo che ho già accettato la supernova
        return rej(this.error.e('server/already-accepted-supernova'));
      } else if (supernovaState.status === 'refusedSupernova') {
        // Se trovo la relazione rifiutata
        return rej(this.error.e('server/supernova-refused'));
      } else if (
        supernovaState.status === 'oneWaysupernovaBind' &&
        supernovaState.oneway != username &&
        accepted
      ) {
        // Se trovo che è già stato accettato il supernova dall'altra persona
        const queryFriendshipCreated: string = `MATCH (u:User {name : "${supernovaState.username}"})-[r:oneWaysupernovaBind]-(t:User) DELETE r MERGE (u)-[:Friend]-(t)`;
        await this.neo4j
          .neo()
          .executeWrite((tx) => tx.run(queryFriendshipCreated));
        const binding: SupernovaBind = { response: 'friendship-created' };
        return res(binding);
      } else if (
        supernovaState.status === 'oneWaysupernovaBind' &&
        supernovaState.oneway != username &&
        !accepted
      ) {
        // Se è già stata accettata la supernova e non sono io e la rifiuto
        const queryFriendshipCreated: string = `MATCH (u:User {name : "${supernovaState.username}"})-[r:oneWaysupernovaBind]-(t:User) DELETE r MERGE (u)-[:refusedSupernova]-(t)`;
        await this.neo4j
          .neo()
          .executeWrite((tx) => tx.run(queryFriendshipCreated));
        const binding: SupernovaBind = { response: 'blocked' };
        return res(binding);
      } else if (supernovaState.status === 'supernovaBind' && !accepted) {
        // Se è stato creato un supernova binding e non lo accetto
        const queryFriendshipCreated: string = `MATCH (u:User {name : "${supernovaState.username}"})-[r:oneWaysupernovaBind]-(t:User) DELETE r MERGE (u)-[:refusedSupernova]-(t)`;
        await this.neo4j
          .neo()
          .executeWrite((tx) => tx.run(queryFriendshipCreated));
        const binding: SupernovaBind = { response: 'blocked' };
        return res(binding);
      }
    });
  };
}
