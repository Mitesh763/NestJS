import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Req,
  Res,
  Session,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from '../users.service';
import { Paginate } from 'nestjs-paginate';
import type { PaginateQuery } from 'nestjs-paginate';
import type { Request, Response } from 'express';
import { SessionAuthGuard } from 'src/auth/guards/session-auth.guard';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { User } from '../user.entity';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { AdminRoleGuardDashboard } from 'src/auth/guards/admin-role-dashboard.guard';

@Controller('users')
@UseGuards(SessionAuthGuard, AdminRoleGuardDashboard)
export class UserWebController {
  constructor(private userService: UsersService) {}

  @Get('admin')
  adminDashboard(
    @Res() response: Response,
    @Session() session: any,
    @CurrentUser() user: any,
  ) {
    if (session.userId)
      response.render('users/admin', {
        pageTitle: 'Admin Dashboard',
        user,
      });
    else response.render('auth/login');
  }

  @Get()
  async getAll(
    @Paginate() query: PaginateQuery,
    @Res() response: Response,
    @CurrentUser() user: User,
  ) {
    const paginatedUsers = await this.userService.findAll(query);
    response.render('users/show', {
      pageTitle: 'User List',
      data: paginatedUsers,
      user,
    });
  }

  @Get('add')
  async addUser(@Res() response: Response, @CurrentUser() user: User) {
    response.render('users/add', {
      pageTitle: 'Add User',
      user,
    });
  }

  @Post('add')
  async registerHandler(
    @Body() registerDto: CreateUserDto,
    @Res() response: Response,
    @Req() request: Request,
  ) {
    const user = await this.userService.createUser(registerDto);

    if (user) {
      //@ts-ignore
      request.flash('success', 'User Added Successfully');
      return response.redirect('/users');
    } else return response.redirect('/users/add');
  }

  @Get(':id')
  async getUserById(
    @Param('id', ParseIntPipe) id: number,
    @Res() response: Response,
    @CurrentUser() user: User,
  ) {
    const profile = await this.userService.findOneById(id);

    response.render('users/update', {
      pageTitle: 'Update User Profile',
      profile,
      user,
    });
  }

  @Put(':id')
  async update(
    @Res() response: Response,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @Req() request: Request,
  ) {
    await this.userService.update(id, updateUserDto);

    //@ts-ignore
    request.flash('success', 'Profile Updated Successfully');
    return response.redirect('/users');
  }

  @Delete(':id')
  async removeUser(
    @Param('id', ParseIntPipe) id: number,
    @Res() response: Response,
    @Req() request: Request,
  ) {
    await this.userService.delete(id);

    //@ts-ignore
    request.flash('success', 'User Removed Successfully');
    return response.redirect('/users');
  }
}
