import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import session from 'express-session';
import { join } from 'path';
import methodOverride from 'method-override';
import ejsMate from 'ejs-mate';
import flash from 'connect-flash';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
const HOST = process.env.IP_ADDRESS || '';
const PORT = process.env.PORT ?? 3000;

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(methodOverride('_method'));

  app.enableCors({
    origin: `http://${HOST}:${PORT}`,
  });

  app.use(
    session({
      secret: process.env.SESSION_KEY,
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 3600000,
      },
    }),
  );

  app.setBaseViewsDir(join(process.cwd(), 'views'));
  app.useStaticAssets(join(process.cwd(), 'public'));
  app.engine('ejs', ejsMate);
  app.setViewEngine('ejs');

  app.use(flash());

  app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.oldInput = req.flash('oldInput')[0] || {};

    res.locals.user = req.user;

    next();
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalFilters(new GlobalExceptionFilter());

  await app.listen(PORT, HOST);

  console.log(`Application is running on: http://${HOST}:${PORT}`);
}
bootstrap();
