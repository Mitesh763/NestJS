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
import { ProductsService } from './products.service';
import { CreateProductDto } from './dtos/create-product.dto';
import { UpdateProductDto } from './dtos/update-product.dto';
import { AdminRoleGuard } from 'src/auth/guards/admin-role.guard';
import { Paginate } from 'nestjs-paginate';
import type { PaginateQuery } from 'nestjs-paginate';
import { Serialize } from 'src/Interceptors/serialize.interceptor';
import { ProductDto } from './dtos/product.dto';
import { ProductPaginationDto } from './dtos/product-pagination.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('api/products')
export class ProductsController {
  constructor(private productService: ProductsService) {}

  // get all products
  @Get()
  @UseGuards(JwtAuthGuard)
  @Serialize(ProductPaginationDto)
  async findAll(@Paginate() query: PaginateQuery) {
    const products = await this.productService.findAll(query);

    if (!products) throw new NotFoundException('Products not found!');

    return products;
  }

  // find all items by category id
  @Get('category/:id')
  @Serialize(ProductDto)
  async findAllByCategoryId(@Param('id', ParseIntPipe) id: number) {
    const products = await this.productService.findAllByCategoryId(id);

    if (!products)
      throw new NotFoundException(
        'Products not found for specified category ID!',
      );

    return products;
  }

  // get one product [show in detailed]
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @Serialize(ProductDto)
  async findOneById(@Param('id', ParseIntPipe) id: number) {
    const product = await this.productService.findOneByProductId(id);

    if (!product) throw new NotFoundException('Product not found!');

    return product;
  }

  // Add new {Admin only}
  @Post()
  @UseGuards(AdminRoleGuard)
  @Serialize(ProductDto)
  create(@Body() body: CreateProductDto) {
    return this.productService.create(body);
  }

  // @Post()
  // @UseGuards(AdminRoleGuard)
  // @UseInterceptors(FileInterceptor('image'))
  // @Serialize(ProductDto)
  // async create(
  //   @Body() body: CreateProductDto,
  //   @UploadedFile() file: Express.Multer.File,
  // ) {
  //   if (!file) {
  //     throw new Error('Product image is required');
  //   }

  //   const imagePath = `./images/${file.originalname}`;

  //   return this.productService.create({
  //     ...body,
  //     image_url: imagePath,
  //   });
  // }

  // Update {Admin only}
  @Patch(':id')
  @UseGuards(AdminRoleGuard)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateProductDto,
  ) {
    if (!body || Object.keys(body).length === 0)
      throw new BadRequestException('Update attribute can not be empty!');

    const product = await this.productService.update(id, body);

    if (!product) throw new NotFoundException('Product not found!');

    return { message: 'Product updated successfully.' };
  }

  // Delete {Admin only}
  @Delete(':id')
  @UseGuards(AdminRoleGuard)
  async delete(@Param('id', ParseIntPipe) id: number) {
    const result = await this.productService.delete(id);

    if (!result) throw new NotFoundException('Product not found!');

    return { message: 'Product deleted successfully.' };
  }
}
