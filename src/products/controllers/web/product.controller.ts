import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseFilePipeBuilder,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request, Response } from 'express';
import { Paginate, type PaginateQuery } from 'nestjs-paginate';
import { AdminRoleGuardDashboard } from 'src/auth/guards/admin-role-dashboard.guard';
import { SessionAuthGuard } from 'src/auth/guards/session-auth.guard';
import { CartsService } from 'src/carts/carts.service';
import { CategoriesService } from 'src/categories/categories.service';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { ProductsService } from 'src/products/products.service';
import { User } from 'src/users/user.entity';

@Controller('products')
@UseGuards(SessionAuthGuard)
export class ProductController {
  constructor(
    private readonly productService: ProductsService,
    private readonly categoryService: CategoriesService,
    private readonly cartsService: CartsService,
  ) {}

  @Get()
  async findAll(
    @Paginate() query: PaginateQuery,
    @Res() response: Response,
    @CurrentUser() user: User,
  ) {
    const products = await this.productService.findAll(query);

    response.render('products/show', {
      pageTitle: 'Products',
      data: products,
      user,
    });
  }

  @Get('list')
  async getList(
    @Paginate() query: PaginateQuery,
    @Res() response: Response,
    @CurrentUser() user: User,
  ) {
    const products = await this.productService.findAll(query);

    response.render('products/list', {
      pageTitle: 'Products',
      data: products,
      user,
    });
  }

  // Client Side Datatable
  // @Get('all')
  // async getProductList(@Paginate() query: PaginateQuery) {
  //   return await this.productService.findAll(query);
  // }

  //Server Side Datatable
  @Get('all')
  async getProductList(
    @Query('page') pageStr: string = '1',
    @Query('limit') limitStr: string = '25',
    @Query('search') search: string,
    @Query('order') order: string,
  ) {
    const page = parseInt(pageStr, 10) || 1;
    const limit = parseInt(limitStr, 10) || 25;

    let sortBy: [string, 'ASC' | 'DESC'][] | undefined;
    if (order) {
      const parts = order.split(':');
      if (parts.length === 2) {
        const [col, dirRaw] = parts;
        const dir = dirRaw.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

        const allowed = [
          'price',
          'description',
          'quantity',
          'title',
          'category.name',
        ];
        if (allowed.includes(col)) {
          sortBy = [[col, dir]];
        }
      }
    }

    const query: PaginateQuery = { page, limit, search, sortBy, path: '' };
    return await this.productService.findAll(query);
  }

  @Get('add')
  @UseGuards(AdminRoleGuardDashboard)
  async create(@Res() response: Response, @CurrentUser() user: User) {
    const categories = await this.categoryService.findAll();

    response.render('products/add', {
      pageTitle: 'Add Product',
      categories,
      user,
    });
  }

  @Post('add')
  @UseGuards(AdminRoleGuardDashboard)
  @UseInterceptors(FileInterceptor('image_url'))
  async createAction(
    @Body() body: any,
    @Res() response: Response,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({ maxSize: 500 * 1000 * 1024 }) // 500MB
        .build(),
    )
    file: Express.Multer.File,
    @Req() request: Request,
  ) {
    // if (!file) throw new NotFoundException(' File Not found');

    body.image_url = file.filename;

    await this.productService.create(body);

    //@ts-ignore
    request.flash('success', 'Product Added Successfully');
    response.redirect('/products');
  }

  @Get(':id')
  @UseGuards(AdminRoleGuardDashboard)
  async update(
    @Res() response: Response,
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const categories = await this.categoryService.findAll();
    const product = await this.productService.findOneByProductId(id);

    response.render('products/update', {
      pageTitle: 'Update Product',
      product,
      categories,
      user,
    });
  }

  @Put(':id')
  @UseGuards(AdminRoleGuardDashboard)
  @UseInterceptors(FileInterceptor('image_url'))
  async updateAction(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
    @Res() response: Response,
    @Req() request: Request,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({ maxSize: 500 * 1000 * 1024 }) // 500MB
        .build(),
    )
    file: Express.Multer.File,
  ) {
    body.image_url = file.filename;

    const product = await this.productService.update(id, body);

    // if (!product) throw new NotFoundException('Product not found!');

    //@ts-ignore
    request.flash('success', 'Product Updated Successfully');
    response.redirect('/products');
  }

  @Delete(':id')
  @UseGuards(AdminRoleGuardDashboard)
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @Res() response: Response,
    @Req() request: Request,
  ) {
    const result = await this.productService.delete(id);

    // if (!result) throw new NotFoundException('Product not found!');

    //@ts-ignore
    request.flash('success', 'Product Removed Successfully');
    response.redirect('/products');
  }
}
