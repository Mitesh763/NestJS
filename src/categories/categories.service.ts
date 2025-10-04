import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Categories } from './categories.entity';
import { Repository } from 'typeorm';
import { CreateCategoryDto } from './dtos/create-categoty.dto';
import { UpdateCategoryDto } from './dtos/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Categories)
    private categoryRepository: Repository<Categories>,
  ) {}

  // get all category
  async findAll() {
    return await this.categoryRepository.find();
  }

  // get one category
  async findOneById(id: number) {
    return await this.categoryRepository.findOne({ where: { id } });
  }

  // get one by category name
  async findOneByName(categoryName: string) {
    return await this.categoryRepository.findOne({
      where: { name: categoryName },
    });
  }

  // create category
  async create(createCategoryDto: CreateCategoryDto) {
    const category = this.categoryRepository.create(createCategoryDto);

    return await this.categoryRepository.save(category);
  }

  // update category
  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.findOneById(id);

    if (!category) return null;

    Object.assign(category, updateCategoryDto);

    return await this.categoryRepository.save(category);
  }

  // delete category
  async delete(id: number) {
    const result = await this.categoryRepository.softDelete(id);

    return result.affected === 0 ? null : result;
  }
}
