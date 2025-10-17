import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { envs } from './config/envs';
import { Logger, ValidationPipe } from '@nestjs/common';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
  const logger = new Logger('Orders-MS');
  const app = await NestFactory.createMicroservice(AppModule,{
    transport: Transport.TCP,
    options: {
     port: envs.port 
    }
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    })
  )
  await app.listen();
  logger.log(`🚀 Orders Microservice running on port: ${envs.port}`);
}
bootstrap();
