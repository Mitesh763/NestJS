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
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { AdminRoleGuard } from 'src/auth/guards/admin-role.guard';
import { UpdatePasswordDto } from './dtos/update-password.dto';
import { Paginate } from 'nestjs-paginate';
import type { PaginateQuery } from 'nestjs-paginate';
import { Serialize } from 'src/Interceptors/serialize.interceptor';
import { UserDto } from './dtos/user.dto';
import { UserPaginationDto } from './dtos/user-pagination.dto';
import { plainToInstance } from 'class-transformer';

@Controller('api/users') // [admin only - auth & role]
@UseGuards(AdminRoleGuard)
export class UsersController {
  constructor(private userService: UsersService) {}

  // create new user
  @Post()
  @Serialize(UserDto)
  async createNewUser(@Body() body: CreateUserDto) {
    const { email } = body;

    const user = await this.userService.findOneByEmail(email);
    if (user)
      throw new ConflictException('Email already exist, Try with another!');

    const newUser = await this.userService.createUser(body);

    if (!newUser) throw new ConflictException('Unexpected error occurred!');

    return newUser;
  }

  // get all user
  @Get()
  @Serialize(UserPaginationDto)
  getAll(@Paginate() query: PaginateQuery) {
    return this.userService.findAll(query);
  }

  // get one user
  @Get(':id')
  @Serialize(UserDto)
  async findOneById(@Param('id', ParseIntPipe) id: number) {
    const user = await this.userService.findOneById(id);

    if (!user) throw new NotFoundException('User not found!');

    return user;
  }

  // change password
  @Patch('change-password/:id')
  async changePassword(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdatePasswordDto,
  ) {
    const result = await this.userService.changePassword(id, body);

    if (!result) throw new BadRequestException('Password does not match!');

    return {
      message: 'Password updated successfully.',
    };
  }

  // update user
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateUserDto,
  ) {
    if (!body || Object.keys(body).length === 0)
      throw new BadRequestException('Update attribute can not be empty!');

    const result = await this.userService.update(id, body);

    if (!result) throw new NotFoundException('User not found!');

    return {
      message: 'User updated successfully.',
      payload: plainToInstance(UserDto, result),
    };
  }

  // remove user
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    const result = await this.userService.delete(id);

    if (!result) throw new NotFoundException('User not found!');

    return { message: 'User deleted successfully.' };
  }
}
