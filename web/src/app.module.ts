import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { ErrorsService } from '@/common/services/errors/errors.service';
import { ValidationService } from '@/common/services/validation/validation.service';
import { FirebaseModule } from '@/config/firebase/firebase.module';
import { Neo4jModule } from '@/config/neo4j/neo4j.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CoreService } from './common/services/core/core.service';
import { AuthController } from './handlers/auth/auth.controller';
import { AuthService } from './handlers/auth/auth.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      envFilePath: ['.env.local', '.env'],
    }),
    FirebaseModule,
    Neo4jModule,
  ],
  controllers: [AppController, AuthController],
  providers: [
    AppService,
    ValidationService,
    ErrorsService,
    CoreService,
    AuthService,
  ],
})
export class AppModule {}
