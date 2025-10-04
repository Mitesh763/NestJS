import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CartsService } from './carts.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { CreateCartDto } from './dtos/create-carts.dto';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { User } from 'src/users/user.entity';
import { Serialize } from 'src/Interceptors/serialize.interceptor';
import { CartDto } from './dtos/cart.dto';

@Controller('api/carts')
@UseGuards(JwtAuthGuard)
export class CartsController {
  constructor(private cartsService: CartsService) {}

  // find all [auth]
  @Get()
  @Serialize(CartDto)
  async findAllByUser(@CurrentUser() user: User) {
    const result = await this.cartsService.findAllByUser(user.id);

    if (!result) throw new NotFoundException('No item found, Add item!');

    return result;
  }

  // add item to cart
  @Post()
  @Serialize(CartDto)
  async addItem(@CurrentUser() user: User, @Body() body: CreateCartDto) {
    const result = await this.cartsService.addToCart(user.id, body);

    return result;
  }

  // update cart(specially quantity only) [auth]
  @Patch(':id')
  async update(@CurrentUser() user: User, @Param('id') id: string) {
    const quantity = 1;

    const result = await this.cartsService.updateQuantity(
      user.id,
      parseInt(id),
      quantity,
    );

    if (!result) throw new NotFoundException('Cart item not found.');

    return result;
  }

  // remove all items(need to where placing order)[auth]
  @Delete()
  removeAllItem(@Req() req: any) {
    return this.cartsService.removeAllItems(req.user.userId);
  }

  // remove item from card [auth]
  @Delete(':id')
  async removeItem(@Req() req: any, @Param('id') id: string) {
    const result = await this.cartsService.removeItem(
      req.user.userId,
      parseInt(id),
    );

    if (!result) throw new NotFoundException('Cart item not found!');

    return result;
  }
}
