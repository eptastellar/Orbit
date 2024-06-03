import { AppModule } from '@/app.module';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { SecuritySchemeObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

const secOptions: SecuritySchemeObject = {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
};

const config = new DocumentBuilder()
  .setVersion('1.0')
  .addBearerAuth(secOptions, 'Firebase_Access_Token')
  .addBearerAuth(secOptions, 'JWT_Session_Token')
  .addBearerAuth(secOptions, 'Cron_Token')
  .build();

async function nest() {
  const app = await NestFactory.create(AppModule, { cors: true });

  // Swagger
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.PORT);
}
nest();
