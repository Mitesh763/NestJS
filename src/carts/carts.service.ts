import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Carts } from './carts.entity';
import { Repository } from 'typeorm';
import { UsersService } from 'src/users/users.service';
import { ProductsService } from 'src/products/products.service';
import { CreateCartDto } from './dtos/create-carts.dto';

@Injectable()
export class CartsService {
  constructor(
    @InjectRepository(Carts) private cartsRepository: Repository<Carts>,
    private usersService: UsersService,
    private productsService: ProductsService,
  ) {}

  // add to cart
  async addToCart(userId: number, createCartDto: CreateCartDto) {
    const product = await this.productsService.findOneByProductId(
      createCartDto.productId,
    );
    if (!product) throw new NotFoundException('Product not found.');

    const cartItem = await this.cartsRepository.findOne({
      where: {
        user: { id: userId },
        product: { id: createCartDto.productId },
      },
    });

    if (cartItem) {
      cartItem.quantity += createCartDto.quantity;
      return this.cartsRepository.save(cartItem);
    } else {
      const user = await this.usersService.findOneById(userId);
      if (!user) throw new NotFoundException('User not found.');

      const newCartItem = this.cartsRepository.create({
        user,
        product,
        quantity: createCartDto.quantity,
      });

      return this.cartsRepository.save(newCartItem);
    }
  }

  // find all cart items
  async findAllByUser(userId: number) {
    return await this.cartsRepository.find({
      where: { userId },
      relations: ['user', 'product'],
    });
  }

  async countRecord(userId: number) {
    return this.cartsRepository.count({ where: { userId } });
  }

  // Update Quantity
  async updateQuantity(userId: number, id: number, quantity: number) {
    const cartItem = await this.cartsRepository.findOne({
      where: { id, user: { id: userId } },
    });
    if (!cartItem) return null;

    if (cartItem.quantity + quantity <= 0) this.removeItem(userId, id);
    else cartItem.quantity += quantity;

    return this.cartsRepository.save(cartItem);
  }

  // remove item
  async removeItem(userId: number, id: number) {
    const result = await this.cartsRepository.softDelete({
      id,
      user: { id: userId },
    });

    return result.affected === 0 ? null : result;
  }

  // remove all items
  async removeAllItems(userId: number) {
    const result = await this.cartsRepository.softDelete({ userId });

    return result.affected === 0 ? null : result;
  }
}
