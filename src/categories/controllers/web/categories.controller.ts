import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AdminRoleGuardDashboard } from 'src/auth/guards/admin-role-dashboard.guard';
import { SessionAuthGuard } from 'src/auth/guards/session-auth.guard';
import { CategoriesService } from 'src/categories/categories.service';
import { CreateCategoryDto } from 'src/categories/dtos/create-categoty.dto';
import { UpdateCategoryDto } from 'src/categories/dtos/update-category.dto';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { User } from 'src/users/user.entity';

@Controller('categories')
@UseGuards(SessionAuthGuard, AdminRoleGuardDashboard)
export class CategoryController {
  constructor(private readonly categoryService: CategoriesService) {}

  @Get()
  async getCategoryList(@CurrentUser() user: User, @Res() response: Response) {
    const categories = await this.categoryService.findAll();

    response.render('category/show', {
      pageTitle: 'Category List',
      user,
      categories,
    });
  }

  @Get('add')
  create(@CurrentUser() user: User, @Res() response: Response) {
    response.render('category/add', { pageTitle: 'Add New Category', user });
  }

  @Post('add')
  async createAction(
    @Body() createCategotyDto: CreateCategoryDto,
    @Res() response: Response,
    @Req() request: Request,
  ) {
    const category = await this.categoryService.findOneByName(
      createCategotyDto.name,
    );

    try {
      if (category)
        throw new ConflictException(
          'Category already exist, Try with another!',
        );
      await this.categoryService.create(createCategotyDto);

      //@ts-ignore
      request.flash('success', 'Category Added Successfully');
      return response.redirect('/categories');
    } catch (error) {
      //@ts-ignore
      request.flash('error', [
        { field: 'category', errors: ['Category already exist!'] },
      ]);

      return response.render('category/add');
    }
  }

  @Get(':id')
  async update(
    @CurrentUser() user: User,
    @Res() response: Response,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const category = await this.categoryService.findOneById(id);

    response.render('category/update', {
      pageTitle: 'Add New Category',
      category,
      user,
    });
  }

  @Put(':id')
  async updateAction(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @Res() response: Response,
    @Req() request: Request,
  ) {
    try {
      if (!updateCategoryDto || Object.keys(updateCategoryDto).length === 0)
        throw new BadRequestException('Update attribute can not be empty!');

      if (updateCategoryDto.name) {
        const category = await this.categoryService.findOneByName(
          updateCategoryDto.name,
        );
        if (category)
          throw new ConflictException(
            'Category already exist, Try with another!',
          );
      }

      await this.categoryService.update(id, updateCategoryDto);

      //@ts-ignore
      request.flash('success', 'Category Updated Successfully');
      return response.redirect('/categories');
    } catch (error) {
      //@ts-ignore
      request.flash('error', [
        { field: 'name', errors: ['Category already exist!'] },
      ]);
      response.render('category/update');
    }
  }

  @Delete(':id')
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @Res() response: Response,
    @Req() request: Request,
  ) {
    await this.categoryService.delete(id);

    //@ts-ignore
    request.flash('success', 'Category Removed Successfully');
    return response.redirect('/categories');
  }
}
