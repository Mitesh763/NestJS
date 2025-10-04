import { Module } from '@nestjs/common';
import { OrderItemsController } from './order-items.controller';
import { OrderItemsService } from './order-items.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order_Item } from './orderItems.entiry';
import { ProductsModule } from 'src/products/products.module';
// import { OrdersModule } from 'src/orders/orders.module';
import { CartsModule } from 'src/carts/carts.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order_Item]),
    ProductsModule,
    CartsModule,
    // OrdersModule,
  ],
  controllers: [OrderItemsController],
  providers: [OrderItemsService],
  exports: [OrderItemsService],
})
export class OrderItemsModule {}
