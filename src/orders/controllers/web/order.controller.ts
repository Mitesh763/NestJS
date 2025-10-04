import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AddressService } from 'src/address/address.service';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { OrderItemsService } from 'src/order-items/order-items.service';
import { CreateOrderDto } from 'src/orders/dtos/create-order.dto';
import { OrdersService } from 'src/orders/orders.service';
import { User } from 'src/users/user.entity';

@Controller('orders')
export class OrderController {
  constructor(
    private readonly orderService: OrdersService,
    private readonly addressService: AddressService,
    private readonly orderItemService: OrderItemsService,
  ) {}

  @Get()
  async getOrderList(@CurrentUser() user: User, @Res() response: Response) {
    const orders = await this.orderService.getAllOrders(user.id);

    response.render('order/show', { pageTitle: 'My Orders', orders, user });
  }

  @Post()
  async create(
    @CurrentUser() user: User,
    @Body() createOrderDto: CreateOrderDto,
    @Res() response: Response,
    @Req() request: Request,
  ) {
    const address = await this.addressService.findDefaultOne(user.id);

    // if (!address) return null;

    //@ts-ignore
    createOrderDto.shippingAddressId = address?.id;

    const order = await this.orderService.createOrder(user.id, createOrderDto);

    await this.orderItemService.addItemToList(user.id, order.id);

    //@ts-ignore
    request.flash('success', 'Order Created Successfully');
    return response.redirect('/orders');
  }

  @Get(':id')
  async getOrderById(
    @CurrentUser() user: User,
    @Res() response: Response,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const order = await this.orderService.getOrderDetail(user.id, id);

    response.render('order/view-order', { pageTitle: 'My Order', order, user });
  }

  @Delete(':id')
  async cancelOrder(
    @CurrentUser() user: User,
    @Res() response: Response,
    @Param('id', ParseIntPipe) id: number,
    @Req() request: Request,
  ) {
    await this.orderService.deleteOrder(user.id, id);

    //@ts-ignore
    request.flash('success', 'Order cancel successfully');
    response.redirect('/orders');
  }
}
