import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Orders, OrderStatus } from './orders.entity';
import { Repository } from 'typeorm';
import { UsersService } from 'src/users/users.service';
import { AddressService } from 'src/address/address.service';
import { UpdateOrderDto } from './dtos/update-order.dto';
import { CreateOrderDto } from './dtos/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Orders) private orderRepository: Repository<Orders>,
    private usersService: UsersService,
    private addressService: AddressService,
  ) {}

  // Create order
  async createOrder(userId: number, orderDetail: CreateOrderDto) {
    const address = await this.addressService.findOneByAddressId(
      orderDetail.shippingAddressId,
      userId,
    );

    if (!address) throw new NotFoundException('Address not Found');

    const user = await this.usersService.findOneById(userId);
    if (!user) throw new NotFoundException('User not found.');

    const total_price = orderDetail.total_price;

    const newOrder = this.orderRepository.create({
      address,
      total_price,
      user,
      status: OrderStatus.PENDING,
    });

    const savedOrder = await this.orderRepository.save(newOrder);

    return savedOrder;
  }

  // get all order
  async getAllOrders(userId: number) {
    return await this.orderRepository.find({
      where: {
        user: { id: userId },
      },
      relations: ['user', 'address', 'items.product'],
    });
  }

  // get order detail by ID
  async getOrderDetail(userId: number, orderId: number) {
    return await this.orderRepository.findOne({
      where: { id: orderId, user: { id: userId } },
      relations: ['user', 'address', 'items.product'],
    });
  }

  // update order
  async updateOrder(
    userId: number,
    orderId: number,
    updateOrderDto: UpdateOrderDto,
  ) {
    const order = await this.getOrderDetail(userId, orderId);

    if (!order) return null;

    const updatedOrder = Object.assign(order, updateOrderDto);

    return this.orderRepository.save(updatedOrder);
  }

  // delete order
  async deleteOrder(userId: number, orderId: number) {
    const result = await this.orderRepository.softDelete({
      id: orderId,
      user: { id: userId },
    });

    return result.affected === 0 ? null : result;
  }
}
