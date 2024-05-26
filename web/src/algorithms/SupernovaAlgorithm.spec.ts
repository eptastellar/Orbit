import { Neo4jModule } from '../config/neo4j/neo4j.module';
import { SupernovaAlgorithm } from './SupernovaAlgorithm';

//TODO need fix
describe('supernova test suite', () => {
  it('should find a suitable match', async () => {
    const user: string = '8DBxwxXYIhSnyJEeFtY20nQaoBa2';
    const expectedFriend: string = 'WfntpfW5x8glDtEAfDgCKWrSSfw1';

    const result: string = await new SupernovaAlgorithm().supernova(user);
    expect(result).toBe(expectedFriend);
  });

  it('should return an error because it cant find the user', async () => {
    const user: string = 'ThisUserDoesNotExist';

    await new SupernovaAlgorithm().supernova(user).catch((error) => {
      expect(error.message).toBe('server/starting-user-not-found');
    });
  });

  it('should return an error because it cant find new friends', async () => {
    const user: string = 'W2LpFm9EjDfduD3NqpN1XpeRVbJ2';

    await new SupernovaAlgorithm().supernova(user).catch((error) => {
      expect(error.message).toBe('Impossible to find new friends');
    });
  });

  it('should find the friend of the friend in the database', async () => {
    const startingUser: string = 'h3yZKtMRYfUvxLeijmSr5SKeCnl2';

    const result: string = await new SupernovaAlgorithm().supernova(
      startingUser,
    );
    expect(result).toBe('jLlAgYRXh5XD5DaABy8zLy3fqUf1');
  });
});

afterAll(() => {
  new Neo4jModule().close();
});
