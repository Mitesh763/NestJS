import { Module } from '@nestjs/common';
import { AddressController } from './address.controller';
import { AddressService } from './address.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Address } from './address.entity';
import { UsersModule } from 'src/users/users.module';
import { AddressesController } from './controllers/web/address.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Address]), UsersModule],
  controllers: [AddressController, AddressesController],
  providers: [AddressService],
  exports: [AddressService],
})
export class AddressModule {}
