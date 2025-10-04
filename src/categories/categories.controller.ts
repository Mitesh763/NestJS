import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dtos/create-categoty.dto';
import { UpdateCategoryDto } from './dtos/update-category.dto';
import { AdminRoleGuard } from 'src/auth/guards/admin-role.guard';
import { Serialize } from 'src/Interceptors/serialize.interceptor';
import { CategoryDto } from './dtos/category.dto';
import { classToPlain } from 'class-transformer';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';

@Controller('api/categories')
export class CategoriesController {
  constructor(private readonly categoryService: CategoriesService) {}

  // get all category
  @Get()
  @UseGuards(JwtAuthGuard)
  @Serialize(CategoryDto)
  async findAll() {
    const categories = await this.categoryService.findAll();

    if (!categories) throw new NotFoundException('There are no category yet!');

    return categories;
  }

  // get one category
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @Serialize(CategoryDto)
  async findOneById(@Param('id', ParseIntPipe) id: number) {
    const category = await this.categoryService.findOneById(id);

    if (!category) throw new NotFoundException('Category not found!');

    return category;
  }

  // create category
  @Post()
  @UseGuards(AdminRoleGuard)
  async create(@Body() createCategotyDto: CreateCategoryDto) {
    const category = await this.categoryService.findOneByName(
      createCategotyDto.name,
    );
    if (category)
      throw new ConflictException('Category already exist, Try with another!');

    const result = await this.categoryService.create(createCategotyDto);

    if (!result) throw new ConflictException('Unknown error occurred!');

    return {
      message: 'Category added successfully!',
      payload: classToPlain(result),
    };
  }

  // update category
  @Put(':id')
  @UseGuards(AdminRoleGuard)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
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

    const result = await this.categoryService.update(id, updateCategoryDto);

    if (!result) throw new NotFoundException('Category not found!');

    return { message: 'Category updated successfully.' };
  }

  // delete category
  @Delete(':id')
  @UseGuards(AdminRoleGuard)
  async delete(@Param('id', ParseIntPipe) id: number) {
    const result = await this.categoryService.delete(id);

    if (!result) throw new NotFoundException('Category not found!');

    return { message: 'Category deleted successfully.' };
  }
}
