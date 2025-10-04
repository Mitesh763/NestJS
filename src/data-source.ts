import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { ConfigService } from '@nestjs/config';
import { User } from './users/user.entity';
import { Address } from './address/address.entity';
import { Product } from './products/product.entity';
import { Carts } from './carts/carts.entity';
import { Orders } from './orders/orders.entity';
import { Order_Item } from './order-items/orderItems.entiry';
import { Token } from './auth/auth.entity';
import { Categories } from './categories/categories.entity';

config();

const configService = new ConfigService();

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: configService.get<string>('DB_HOST'),
  port: configService.get<number>('DB_PORT'),
  username: configService.get<string>('DB_USERNAME'),
  password: configService.get<string>('DB_PASSWORD'),
  database: configService.get<string>('DB_NAME'),
  synchronize: false,
  entities: [
    User,
    Address,
    Product,
    Carts,
    Orders,
    Order_Item,
    Token,
    Categories,
  ],
  migrations: [__dirname + '/migration/*.ts'],
});
