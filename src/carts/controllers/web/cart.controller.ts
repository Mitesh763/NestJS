import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { SessionAuthGuard } from 'src/auth/guards/session-auth.guard';
import { CartsService } from 'src/carts/carts.service';
import { CreateCartDto } from 'src/carts/dtos/create-carts.dto';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { User } from 'src/users/user.entity';

@Controller('carts')
@UseGuards(SessionAuthGuard)
export class CartController {
  constructor(private readonly cartsService: CartsService) {}

  @Get()
  async getCartItems(@CurrentUser() user: User, @Res() response: Response) {
    const cart = await this.cartsService.findAllByUser(user.id);

    // const itemCount = await this.cartsService.countRecord(currentUser.id);

    response.render('cart/show', {
      pageTitle: 'Shopping Cart',
      cart,
      //   itemCount,
      user,
    });
  }

  @Post()
  async addItem(
    @CurrentUser() user: User,
    @Body() createCartDto: CreateCartDto,
    @Res() response: Response,
    @Req() request: Request,
  ) {
    await this.cartsService.addToCart(user.id, createCartDto);

    //@ts-ignore
    request.flash('success', 'Product Item added to cart Successfully');
    return response.redirect('/products');
  }

  @Put('decrease/:id')
  async descreaseQuantity(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) id: number,
    @Res() response: Response,
  ) {
    const quantity = -1;

    await this.cartsService.updateQuantity(user.id, id, quantity);

    // if (!result) throw new NotFoundException('Cart item not found.');

    return response.redirect('/carts');
  }

  @Put('increase/:id')
  async increaseQuantity(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) id: number,
    @Res() response: Response,
  ) {
    const quantity = 1;

    await this.cartsService.updateQuantity(user.id, id, quantity);

    // if (!result) throw new NotFoundException('Cart item not found.');

    return response.redirect('/carts');
  }
}
