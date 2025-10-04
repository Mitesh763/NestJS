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
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dtos/create-order.dto';
import { UpdateOrderDto } from './dtos/update-order.dto';
import { Serialize } from 'src/Interceptors/serialize.interceptor';
import { OrderDto } from './dtos/order.dto';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { User } from 'src/users/user.entity';

@Controller('api/orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  // create order [auth]
  @Post()
  @Serialize(OrderDto)
  createOrder(@CurrentUser() user: User, @Body() body: CreateOrderDto) {
    return this.ordersService.createOrder(user.id, body);
  }

  // get all order
  @Get()
  @Serialize(OrderDto)
  async getAllOrders(@CurrentUser() user: User) {
    const orders = await this.ordersService.getAllOrders(user.id);

    if (!orders)
      throw new NotFoundException('Order not found on your account!');

    return orders;
  }

  // get order by ID
  @Get(':id')
  @Serialize(OrderDto)
  async getOrderDetail(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) orderId: number,
  ) {
    const order = await this.ordersService.getOrderDetail(user.id, orderId);

    if (!order) throw new NotFoundException('Order not found!');

    return order;
  }

  // update order
  @Patch(':id')
  async updateOrder(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) orderId: number,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    if (!updateOrderDto || Object.keys(updateOrderDto).length === 0)
      throw new BadRequestException('Update attribute can not be empty!');

    const result = await this.ordersService.updateOrder(
      user.id,
      orderId,
      updateOrderDto,
    );

    if (!result) throw new NotFoundException('Order not found!');

    return { message: 'Order updated successfully.' };
  }

  // delete order
  @Delete(':id')
  async deleteOrder(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) orderId: number,
  ) {
    const result = await this.ordersService.deleteOrder(user.id, orderId);

    if (!result) throw new NotFoundException('Order not found!');

    return { message: 'Order deleted successfully!' };
  }
}
