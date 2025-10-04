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
  UseGuards,
} from '@nestjs/common';
import { OrderItemsService } from './order-items.service';
import { CreateOrderItemDto } from './dtos/create-orderItem.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { UpdateOrderItemDto } from './dtos/update-orderItem.dto';
import { Serialize } from 'src/Interceptors/serialize.interceptor';
import { OrderItemDto } from './dtos/orderItem.dto';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { User } from 'src/users/user.entity';
import { AdminRoleGuard } from 'src/auth/guards/admin-role.guard';

@Controller('api/order-items')
@UseGuards(JwtAuthGuard)
export class OrderItemsController {
  constructor(private orderItemService: OrderItemsService) {}

  // add to list
  @Post()
  addItemToList(
    @CurrentUser() user: User,
    @Body() createOrderItemDto: CreateOrderItemDto,
  ) {
    return this.orderItemService.addItemToList(user.id, createOrderItemDto);
  }

  // find all
  @Get()
  @Serialize(OrderItemDto)
  async findAll(@CurrentUser() user: User) {
    const items = await this.orderItemService.findAll(user.id);

    if (!items) throw new NotFoundException('Your order item list is empty!');

    return items;
  }

  // find one
  @Get(':id')
  @Serialize(OrderItemDto)
  async findOneById(@Param('id') id: string, @CurrentUser() user: User) {
    const item = await this.orderItemService.findOneById(parseInt(id), user.id);

    if (!item) throw new NotFoundException('This item not found in list!');

    return item;
  }

  // update order item
  @Patch(':id')
  @Serialize(AdminRoleGuard)
  async updateOrederItem(
    @Param('id', ParseIntPipe) itemId: number,
    @CurrentUser() user: User,
    @Body() updateDetail: UpdateOrderItemDto,
  ) {
    if (!updateDetail || Object.keys(updateDetail).length === 0)
      throw new BadRequestException('Update attribute can not be empty!');

    const result = await this.orderItemService.updateOrderItem(
      user.id,
      itemId,
      updateDetail,
    );

    if (!result) throw new NotFoundException('Order item not found!');

    return { message: 'Order item updated successfully.' };
  }

  // remove form list
  @Delete(':id')
  @Serialize(AdminRoleGuard)
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ) {
    const result = await this.orderItemService.delete(id, user.id);

    if (!result) throw new NotFoundException('Order items not found!');

    return { message: 'Order items deleted successfully!' };
  }
}
