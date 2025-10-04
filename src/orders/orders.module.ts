import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Orders } from './orders.entity';
import { UsersModule } from 'src/users/users.module';
import { AddressModule } from 'src/address/address.module';
import { OrderController } from './controllers/web/order.controller';
import { OrderItemsModule } from 'src/order-items/order-items.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Orders]),
    UsersModule,
    AddressModule,
    OrderItemsModule,
  ],
  controllers: [OrdersController, OrderController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
