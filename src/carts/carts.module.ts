import { forwardRef, Module } from '@nestjs/common';
import { CartsController } from './carts.controller';
import { CartsService } from './carts.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Carts } from './carts.entity';
import { UsersModule } from 'src/users/users.module';
import { ProductsModule } from 'src/products/products.module';
import { CartController } from './controllers/web/cart.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Carts]),
    UsersModule,
    forwardRef(() => ProductsModule),
  ],
  controllers: [CartsController, CartController],
  providers: [CartsService],
  exports: [CartsService],
})
export class CartsModule {}
