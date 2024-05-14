import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { FirebaseModule } from './config/firebase/firebase.module';
import { Neo4jModule } from './config/neo4j/neo4j.module';
import { AuthModule } from './handlers/auth/auth.module';
import { ValidationService } from './common/services/validation/validation.service';
import { ErrorsService } from './common/services/errors/errors.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      envFilePath: ['.env.local', '.env'],
    }),
    FirebaseModule,
    Neo4jModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService, ValidationService, ErrorsService],
})
export class AppModule {}
