import { CoreService, ErrorsService } from '@/common';
import { Neo4jModule } from '@/config';
import { UserSchema } from '@/types';
import { Injectable } from '@nestjs/common';
import { QueryResult } from 'neo4j-driver';

@Injectable()
export class QrService {
  private error: ErrorsService;
  private coreService: CoreService;
  private neo4j: Neo4jModule;

  constructor() {
    this.error = new ErrorsService();
    this.coreService = new CoreService();
    this.neo4j = new Neo4jModule();
  }

  public findRandomFriendCode = (
    uid: string,
    friendCode: string,
  ): Promise<UserSchema> => {
    return new Promise(async (resolve, reject) => {
      const friendCodeRequest: number = Date.now();
      const queryXFriend: string = `MATCH (u:User{friendCode : '${friendCode}'}), (t:User{name : "${uid}"}) WHERE u.friendCodeTime >=  "${friendCodeRequest}" MERGE (u)-[:Friend]-(t)`; //sets the friend connection
      await this.neo4j.neo().executeWrite((tx) => tx.run(queryXFriend));

      const queryXUser: string = `MATCH (u:User{friendCode : '${friendCode}'}) RETURN u.name`; // Searches for the name of the friend which i scanned the code
      const nameResult: QueryResult = await this.neo4j
        .neo()
        .executeRead((tx) => tx.run(queryXUser));
      const name: string[] = nameResult.records.map((row: any) =>
        row.get('u.name'),
      );

      const queryXConfirm: string = `OPTIONAL MATCH p = (u:User {name : "${uid}"}) - [:Friend] - (t:User {name:"${name}"}) RETURN p`; //Checks if it created the connection, if it doesnt returns null
      const confirmResult: QueryResult = await this.neo4j
        .neo()
        .executeRead((tx) => tx.run(queryXConfirm));
      const confirm: string[] = confirmResult.records.map((row: any) =>
        row.get('p'),
      );

      if (confirm[0] === null)
        return reject(this.error.e('server/friend-code-failed'));
      else {
        const userSchema: UserSchema =
          await this.coreService.getUserDataFromUid(name[0]);
        return resolve(userSchema);
      }
    });
  };

  public setRandomFriendCode = (
    uid: string,
    friendCode: string,
  ): Promise<number> => {
    return new Promise(async (resolve) => {
      const friendCodeTimer: number = Date.now() + 60000;
      const query: string = `MATCH (u:User) where u.name = '${uid}' SET u.friendCode = '${friendCode}', u.friendCodeTime = '${friendCodeTimer}'`; //sets the random number to myself in neo
      await this.neo4j.neo().executeWrite((tx) => tx.run(query));

      return resolve(friendCodeTimer);
    });
  };
}
