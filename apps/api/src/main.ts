import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { ApiExceptionFilter } from './common/api-exception.filter';
import { requestIdMiddleware } from './common/request-id.middleware';
import { parseTrustedProxyCidrs } from './common/trusted-proxy';
import { resolveWebOrigin } from './common/cors-origin';
import { RequestIdInterceptor } from './common/request-id.interceptor';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: resolveWebOrigin(process.env.APP_URL), credentials: true, exposedHeaders: ['X-Request-Id'] });
  const trustedProxyCidrs = parseTrustedProxyCidrs(process.env.TRUSTED_PROXY_CIDRS);
  if (trustedProxyCidrs.length > 0) app.getHttpAdapter().getInstance().set('trust proxy', trustedProxyCidrs);
  app.setGlobalPrefix(process.env.API_PREFIX ?? 'api/v1');
  app.use(helmet());
  app.use(cookieParser());
  app.use(requestIdMiddleware);
  app.useGlobalFilters(new ApiExceptionFilter());
  app.useGlobalInterceptors(new RequestIdInterceptor());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Enterprise Corporate Portal API')
    .setDescription('API nền tảng cổng thông tin doanh nghiệp')
    .setVersion('1.0')
    .addCookieAuth('portal_session')
    .build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, swaggerConfig));
  await app.listen(Number(process.env.PORT ?? 4000));
}

void bootstrap();
