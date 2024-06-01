import { ErrorsService } from '@/common';
import { FirebaseModule, Neo4jModule } from '@/config';
import { SuccessResponse } from '@/types';
import { Injectable } from '@nestjs/common';
import { randomInt } from 'crypto';
import { Firestore } from 'firebase-admin/firestore';
import { QueryResult } from 'neo4j-driver';

@Injectable()
export class CronService {
  private error: ErrorsService;
  private db: Firestore;
  private neo4j: Neo4jModule;

  constructor() {
    this.error = new ErrorsService();
    this.db = new FirebaseModule().getFirestore();
    this.neo4j = new Neo4jModule();
  }

  public keepAliveNeo = (): Promise<SuccessResponse> => {
    return new Promise(async (resolve, reject) => {
      try {
        const query = 'MATCH (c:Cron) RETURN c';
        const result = await this.neo4j
          .neo()
          .executeRead((tx) => tx.run(query));
        const node = result.records.map((row) => row.get('c'));

        if (node[0]) {
          const successResponse: SuccessResponse = {
            success: true,
          };
          return resolve(successResponse);
        } else return reject(this.error.e('cron/driver-not-found'));
      } catch {
        return reject(this.error.e('cron/driver-not-found'));
      }
    });
  };

  public meteor = (): Promise<SuccessResponse> => {
    return new Promise(async (resolve, reject) => {
      try {
        this.neo4j
          .neo()
          .executeRead((tx) => tx.run('MATCH (u:User) RETURN u.name AS uid'))
          .then(async (result) => {
            result.records.map(async (record) => {
              const uid: string = record.get('uid');
              const friend: string = await this.meteorAlgorithm(uid);
              console.log(friend, 'is the friend of', uid);
              return resolve({ success: true });
            });
          });
      } catch {
        return reject(this.error.e('cron/meteor-algorithm-failed'));
      }
    });
  };

  private meteorAlgorithm = async (uid: string): Promise<string> => {
    return new Promise(async (resolve, reject) => {
      await this.neo4j
        .neo()
        .executeRead((tx) =>
          tx.run(
            'MATCH (u:User{name : $uid})-[:Friend]-(t:User) return t.name as names',
            { uid: uid },
          ),
        )
        .then((result: QueryResult) => {
          const names: string[] = result.records.map((record) =>
            record.get('names'),
          );
          if (names.length === 0) return resolve('No friends found');
          else return resolve(names[randomInt(0, names.length)]);
        })
        .catch((error: Error) => {
          return reject(error);
        });
    });
  };

  public garbageCollector = (): Promise<SuccessResponse> => {
    return new Promise(async (resolve, reject) => {
      try {
        const snapshotAllMessages = await this.db
          .collection('messages')
          .where('created_at', '<', Date.now() - 86400000)
          .get();
        const snapshotUnreadMessages = await this.db
          .collection('opened-messages')
          .where('opened', '==', false)
          .get();
        snapshotAllMessages.forEach(async (doc) => {
          if (
            !snapshotUnreadMessages.docs.find(
              (d) => d.data().message_id === doc.id,
            )
          ) {
            await this.db.collection('messages').doc(doc.id).delete();
          }
        });
        return resolve({ success: true });
      } catch {
        return reject(this.error.e('cron/garbage-collector-failed'));
      }
    });
  };
}
