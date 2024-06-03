import { Test, TestingModule } from '@nestjs/testing';
import { SupernovaService } from './supernova.service';

describe('SupernovaService', () => {
  let service: SupernovaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SupernovaService],
    }).compile();

    service = module.get<SupernovaService>(SupernovaService);
  });

  it('should find a suitable match', async () => {
    const user: string = '8DBxwxXYIhSnyJEeFtY20nQaoBa2';
    const expectedFriend: string = 'WfntpfW5x8glDtEAfDgCKWrSSfw1';

    const result: string = await service.supernova(user);
    expect(result).toBe(expectedFriend);
  });

  it('should return an error because it cant find new friends', async () => {
    const user: string = 'W2LpFm9EjDfduD3NqpN1XpeRVbJ2';

    await service.supernova(user).catch((error) => {
      expect(error.message).toBe('Impossible to find new friends');
    });
  }, 10000);

  it('should find the friend of the friend in the database', async () => {
    const startingUser: string = 'h3yZKtMRYfUvxLeijmSr5SKeCnl2';

    const result: string = await service.supernova(startingUser);
    expect(result).toBe('jLlAgYRXh5XD5DaABy8zLy3fqUf1');
  });

  afterEach(() => {
    service.getNeo4J().close();
  });
});
