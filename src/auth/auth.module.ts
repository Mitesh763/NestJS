import { forwardRef, MiddlewareConsumer, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { config } from 'dotenv';
import { ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategies/local.strategy';
import { UsersModule } from 'src/users/users.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Token } from './auth.entity';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { LoginController } from './controller/web/login.controller';
import { RegisterController } from './controller/web/register.controller';
import { CurrentUserMiddleware } from './middlewares/current-user.middleware';
import { AuthUserController } from './controller/web/auth-user.controller';
import { extname } from 'path';
import { GoogleStrategy } from './strategies/google.strategy';

config();

const configService = new ConfigService();

@Module({
  imports: [
    TypeOrmModule.forFeature([Token]),
    PassportModule.register({ defaultStrategy: 'google' }),
    JwtModule.register({
      secret: configService.get<string>('JWT_SECRET'),
      signOptions: {
        expiresIn: configService.get<string>('JWT_EXPIRATION_TIME'),
      },
    }),
    forwardRef(() => UsersModule),
    MulterModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        storage: diskStorage({
          destination: configService.get<string>('MULTER_DEST'),
          filename: (req, file, callback) => {
            const ext = extname(file.originalname);
            const safeName = file.originalname
              .split(' ')
              .join('_')
              .replace(ext, '');
            callback(null, `${safeName}${ext}`);
          },
        }),
      }),
    }),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy, GoogleStrategy],
  controllers: [
    AuthController,
    LoginController,
    RegisterController,
    AuthUserController,
  ],
  exports: [AuthService],
})
export class AuthModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CurrentUserMiddleware).forRoutes('*');
  }
}
