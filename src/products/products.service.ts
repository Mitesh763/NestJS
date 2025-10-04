import { Injectable, NotFoundException } from '@nestjs/common';
import { Product } from './product.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateProductDto } from './dtos/create-product.dto';
import { UpdateProductDto } from './dtos/update-product.dto';
import { paginate, Paginated, PaginateQuery } from 'nestjs-paginate';
import { CategoriesService } from 'src/categories/categories.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private repo: Repository<Product>,
    private readonly categoryService: CategoriesService,
  ) {}

  // get all
  async findAll(query: PaginateQuery): Promise<Paginated<Product>> {
    return paginate(query, this.repo, {
      sortableColumns: [
        'price',
        'description',
        'quantity',
        'title',
        'category.name',
      ],
      searchableColumns: ['title', 'price', 'description', 'category'],
      defaultSortBy: [
        ['price', 'ASC'],
        ['quantity', 'DESC'],
      ],
      relations: ['category'],
    });
  }

  // get one by product id
  async findOneByProductId(id: number) {
    return await this.repo.findOne({ where: { id }, relations: ['category'] });
  }

  // get all by category id
  async findAllByCategoryId(categoryId: number) {
    const category = await this.categoryService.findOneById(categoryId);

    if (!category) throw new NotFoundException('Category not found'!);

    return await this.repo.find({
      where: { category: { id: categoryId } },
      relations: ['category'],
    });
  }

  // new
  async create(productDetail: CreateProductDto) {
    const category = await this.categoryService.findOneById(
      productDetail.categoryId,
    );

    if (!category) throw new NotFoundException('Category not found'!);

    const product = this.repo.create({ ...productDetail, category });

    return this.repo.save(product);
  }

  // update
  async update(id: number, updatedProductDetail: UpdateProductDto) {
    const category = await this.categoryService.findOneById(
      updatedProductDetail.categoryId,
    );

    if (!category) throw new NotFoundException('Category not found'!);

    const product = await this.findOneByProductId(id);

    if (!product) return null;

    Object.assign(product, updatedProductDetail);

    if (updatedProductDetail.categoryId) product.category = category;

    return this.repo.save(product);
  }

  // delete
  async delete(id: number) {
    const result = await this.repo.softDelete(id);

    if (result.affected === 0) return null;

    return result;
  }
}
