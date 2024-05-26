import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import {
  AccessMiddleware,
  CronMiddleware,
  SessionMiddleware,
} from '@/common/middlewares';
import { CoreService } from '@/common/services/core/core.service';
import { ErrorsService } from '@/common/services/errors/errors.service';
import { ValidationService } from '@/common/services/validation/validation.service';
import { FirebaseModule } from '@/config/firebase/firebase.module';
import { Neo4jModule } from '@/config/neo4j/neo4j.module';
import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './handlers/auth/auth.module';
import { CommentsModule } from './handlers/comments/comments.module';
import { InterestsModule } from './handlers/interests/interests.module';
import { PostsModule } from './handlers/posts/posts.module';
import { QrModule } from './handlers/qr/qr.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      envFilePath: ['.env.local', '.env'],
    }),
    FirebaseModule,
    Neo4jModule,
    CommentsModule,
    QrModule,
    InterestsModule,
    AuthModule,
    PostsModule,
  ],
  controllers: [AppController],
  providers: [AppService, ValidationService, ErrorsService, CoreService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AccessMiddleware)
      .exclude({ path: 'auth/sign-up/validate', method: RequestMethod.ALL })
      .forRoutes({ path: 'auth/sign-*', method: RequestMethod.ALL })
      .apply(CronMiddleware)
      .forRoutes({ path: 'cron/*', method: RequestMethod.ALL })
      .apply(SessionMiddleware)
      .exclude(
        { path: 'auth/sign-in', method: RequestMethod.ALL },
        { path: 'auth/sign-up', method: RequestMethod.ALL },
        { path: 'auth/sign-up/validate', method: RequestMethod.ALL },
        { path: 'cron/(.*)', method: RequestMethod.ALL },
        { path: 'interests', method: RequestMethod.ALL },
        { path: 'c', method: RequestMethod.ALL },
        { path: '/', method: RequestMethod.ALL },
      )
      .forRoutes({ path: '*', method: RequestMethod.ALL }); //TODO
  }
}
