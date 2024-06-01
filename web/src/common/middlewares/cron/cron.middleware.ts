import { ErrorsService } from '@/common';
import { Injectable, NestMiddleware } from '@nestjs/common';

@Injectable()
export class CronMiddleware implements NestMiddleware {
  private error: ErrorsService;

  constructor() {
    this.error = new ErrorsService();
  }

  use(req: any, res: any, next: () => void) {
    console.log('cron middleware');

    const authorization: string = req.headers.authorization!;

    if (authorization) {
      const secret: string = authorization.split('Bearer ')[1];

      if (secret === process.env.CRON_SECRET) next();
      else return res.send(this.error.e('auth/invalid-token'));
    } else return res.send(this.error.e('auth/invalid-token'));
  }
}
