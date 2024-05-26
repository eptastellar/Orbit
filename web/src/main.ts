import { AppModule } from '@/app.module';
import { NestFactory } from '@nestjs/core';

async function nest() {
  const app = await NestFactory.create(AppModule, { cors: true });
  await app.listen(process.env.PORT);
}
nest();
