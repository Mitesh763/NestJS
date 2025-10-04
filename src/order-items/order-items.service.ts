import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order_Item } from './orderItems.entiry';
import { Repository } from 'typeorm';
import { CreateOrderItemDto } from './dtos/create-orderItem.dto';
import { ProductsService } from 'src/products/products.service';
// import { OrdersService } from 'src/orders/orders.service';
import { UpdateOrderItemDto } from './dtos/update-orderItem.dto';
import { CartsService } from 'src/carts/carts.service';

@Injectable()
export class OrderItemsService {
  constructor(
    @InjectRepository(Order_Item)
    private orderItemRepository: Repository<Order_Item>,
    private productsService: ProductsService,
    private cartService: CartsService,
    // private ordersService: OrdersService,
  ) {}

  // add Item in oreder list
  async addItemToList(userId: number, createOrderItemDto: any) {
    // const order = await this.ordersService.getOrderDetail(
    //   userId,
    //   createOrderItemDto.orderId,
    // );

    // if (!order) throw new NotFoundException('Order not found!');

    const orderItems = await this.cartService.findAllByUser(userId);

    if (!orderItems)
      throw new NotFoundException('Your cart is empty, add item to cart!');

    for (const item of orderItems) {
      const product = item.product;

      const isProductAvailable = await this.productsService.findOneByProductId(
        product.id,
      );
      if (!isProductAvailable)
        throw new NotFoundException(`${product.title} not available yet!`);

      const newItem = await this.orderItemRepository.create({
        product,
        order: createOrderItemDto,
        quantity: item.quantity,
      });

      await this.orderItemRepository.save(newItem);
    }

    const result = await this.cartService.removeAllItems(userId);

    if (!result) throw new ConflictException('Item removal failed');

    return { message: 'Order items added successully.' };
  }

  // get all order item
  async findAll(userId: number) {
    return await this.orderItemRepository.find({
      where: { order: { user: { id: userId } } },
      relations: ['order', 'product'],
    });
  }

  // get one item
  async findOneById(id: number, userId: number) {
    return await this.orderItemRepository.findOne({
      where: { id, order: { user: { id: userId } } },
      relations: ['order', 'product'],
    });
  }

  // update order item
  async updateOrderItem(
    userId: number,
    itemId: number,
    updateDetail: UpdateOrderItemDto,
  ) {
    const item = await this.findOneById(itemId, userId);

    if (!item) return null;

    Object.assign(item, updateDetail);

    return await this.orderItemRepository.save(item);
  }

  // remove item
  async delete(id: number, userId: number) {
    const result = await this.orderItemRepository.softDelete({
      order: { user: { id: userId }, id },
    });

    if (result.affected === 0) return null;

    return result;
  }
}
