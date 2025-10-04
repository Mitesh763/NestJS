import { forwardRef, Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './product.entity';
import { CategoriesModule } from 'src/categories/categories.module';
import { ProductController } from './controllers/web/product.controller';
import { CartsModule } from 'src/carts/carts.module';
import { extname } from 'path';
import { ConfigService } from '@nestjs/config';
import { diskStorage } from 'multer';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product]),
    CategoriesModule,
    forwardRef(() => CartsModule),
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
  controllers: [ProductsController, ProductController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
