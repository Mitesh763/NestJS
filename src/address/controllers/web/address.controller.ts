import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Req,
  Res,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AddressService } from 'src/address/address.service';
import { CreateAddressDto } from 'src/address/dtos/create-address.dto';
import { UpdateAddressDto } from 'src/address/dtos/update-address.dto';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { User } from 'src/users/user.entity';

@Controller('address')
export class AddressesController {
  constructor(private readonly addressService: AddressService) {}

  @Get()
  async getAddressList(@CurrentUser() user: User, @Res() response: Response) {
    const addresses = await this.addressService.findAllByUserId(user.id);

    response.render('address/show', {
      pageTitle: 'Address List',
      addresses,
      user,
    });
  }

  @Get('new')
  create(@CurrentUser() user: User, @Res() response: Response) {
    response.render('address/add', { pageTitle: 'Add New Address', user });
  }

  @Post()
  async createAction(
    @CurrentUser() user: User,
    @Res() response: Response,
    @Body() createAddressDto: CreateAddressDto,
    @Req() request: Request,
  ) {
    await this.addressService.create(createAddressDto, user);

    //@ts-ignore
    request.flash('success', 'Address Saved Successfully');
    return response.redirect('/address');
  }

  @Get(':id')
  async getAddressById(
    @CurrentUser() user: User,
    @Res() response: Response,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const address = await this.addressService.findOneByAddressId(id, user.id);

    response.render('address/update', {
      pageTitle: 'Address List',
      address,
      user,
    });
  }

  @Put(':id')
  async update(
    @CurrentUser() user: User,
    @Res() response: Response,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAdddressDto: UpdateAddressDto,
    @Req() request: Request,
  ) {
    await this.addressService.update(id, user.id, updateAdddressDto);

    //@ts-ignore
    request.flash('success', 'Address Updated Successfully');
    return response.redirect('/address');
  }

  @Delete(':id')
  async delete(
    @CurrentUser() user: User,
    @Res() response: Response,
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ) {
    await this.addressService.remove(id, user.id);

    //@ts-ignore
    request.flash('success', 'Address Removed Successfully');
    return response.redirect('/address');
  }
}
