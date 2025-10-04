import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AddressService } from './address.service';
import { CreateAddressDto } from './dtos/create-address.dto';
import { UpdateAddressDto } from './dtos/update-address.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { Serialize } from 'src/Interceptors/serialize.interceptor';
import { AddressDto } from './dtos/address.dto';
import { User } from 'src/users/user.entity';
import { CurrentUser } from 'src/decorators/current-user.decorator';

@Controller('api/address')
@UseGuards(JwtAuthGuard) // [ auth/own ]
export class AddressController {
  constructor(private addressService: AddressService) {}

  // get addresses for current user
  @Get()
  @Serialize(AddressDto)
  getMyAddresses(@CurrentUser() user: User) {
    const addresses = this.addressService.findAllByUserId(user.id);

    if (!addresses) throw new NotFoundException('Address not found!');

    return addresses;
  }

  // get by id
  @Get(':id')
  @Serialize(AddressDto)
  async getAddressById(@CurrentUser() user: User, @Param('id') id: string) {
    const address = await this.addressService.findOneByAddressId(
      parseInt(id),
      user.id,
    );

    if (!address) throw new NotFoundException('Address not found!');

    return address;
  }

  // create
  @Post()
  @Serialize(AddressDto)
  async create(@CurrentUser() user: User, @Body() body: CreateAddressDto) {
    return await this.addressService.create(body, user);
  }

  // update
  @Patch(':id')
  async update(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateAddressDto,
  ) {
    if (!body || Object.keys(body).length === 0)
      throw new BadRequestException('Update attribute can not be empty!');

    const result = await this.addressService.update(id, user.id, body);

    if (!result) throw new NotFoundException('Address not found!');

    return { message: 'Address updated successfully.' };
  }

  // remove
  @Delete(':id')
  async remove(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const result = await this.addressService.remove(id, user.id);

    if (!result) throw new NotFoundException('Address not found!');

    return { message: 'Address deleted successfully.' };
  }
}
