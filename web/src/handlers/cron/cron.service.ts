import { MeteorAlgorithm } from '@/algorithms';
import { ErrorsService } from '@/common';
import { FirebaseModule, Neo4jModule } from '@/config';
import { SuccessResponse } from '@/types';
import { Injectable } from '@nestjs/common';
import { Firestore } from 'firebase-admin/firestore';

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
              const friend: string = await new MeteorAlgorithm().meteor(uid);
              console.log(friend, 'is the friend of', uid);
              return resolve({ success: true });
            });
          });
      } catch {
        return reject(this.error.e('cron/meteor-algorithm-failed'));
      }
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
