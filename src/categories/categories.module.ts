import { Module } from '@nestjs/common';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Categories } from './categories.entity';
import { CategoryController } from './controllers/web/categories.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Categories])],
  controllers: [CategoriesController, CategoryController],
  providers: [CategoriesService],
  exports: [CategoriesService],
})
export class CategoriesModule {}
