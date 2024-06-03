import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { CoreService, ErrorsService, ValidationService } from '@/common';
import {
  AccessMiddleware,
  CronMiddleware,
  SessionMiddleware,
} from '@/common/middlewares';
import { FirebaseModule, Neo4jModule } from '@/config';
import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './handlers/auth/auth.module';
import { ChatsModule } from './handlers/chats/chats.module';
import { CommentsModule } from './handlers/comments/comments.module';
import { CronModule } from './handlers/cron/cron.module';
import { HomeModule } from './handlers/home/home.module';
import { InterestsModule } from './handlers/interests/interests.module';
import { LikesModule } from './handlers/likes/likes.module';
import { MessagesModule } from './handlers/messages/messages.module';
import { PostsModule } from './handlers/posts/posts.module';
import { QrModule } from './handlers/qr/qr.module';
import { SupernovaModule } from './handlers/supernova/supernova.module';
import { UserModule } from './handlers/user/user.module';
import { NotificationsModule } from './handlers/notifications/notifications.module';

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
    HomeModule,
    ChatsModule,
    MessagesModule,
    CronModule,
    UserModule,
    LikesModule,
    SupernovaModule,
    NotificationsModule,
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
        { path: 'auth/sign-in', method: RequestMethod.GET },
        { path: 'auth/sign-up', method: RequestMethod.POST },
        { path: 'docs/*', method: RequestMethod.GET },
        { path: 'docs-json', method: RequestMethod.GET },
        { path: 'auth/sign-up/validate', method: RequestMethod.POST },
        { path: 'cron/*', method: RequestMethod.ALL },
        { path: 'interests', method: RequestMethod.GET },
        { path: 'c', method: RequestMethod.ALL },
        { path: '/', method: RequestMethod.GET },
      )
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
