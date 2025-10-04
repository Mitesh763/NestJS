import {
  Body,
  ConflictException,
  Controller,
  Get,
  Post,
  Req,
  Res,
  Session,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from 'src/auth/auth.service';
import { SignUpDto } from 'src/auth/dtos/sign-up.dto';
import { SessionAuthGuard } from 'src/auth/guards/session-auth.guard';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { roleEnum, User } from 'src/users/user.entity';

@Controller('auth')
export class RegisterController {
  constructor(private readonly authService: AuthService) {}

  @Get('signup')
  register(
    @Res() response: Response,
    @Session() session: any,
    @CurrentUser() currentUser: User,
  ) {
    if (session.userId) {
      if (currentUser.role === roleEnum.ADMIN)
        response.redirect('/users/admin');
      else response.redirect('/auth/user');
    } else response.render('auth/signup');
  }

  @Post('signup')
  async registerHandler(
    @Body() registerDto: SignUpDto,
    @Session() session: any,
    @Res() response: Response,
    @Req() request: Request,
  ) {
    try {
      const userExist = await this.authService.findByEmail(registerDto.email);

      if (userExist)
        throw new ConflictException('Email already exist, Try with another!');

      const user = await this.authService.createNewUser(registerDto);

      if (user) {
        session.userId = user.id;

        if (user.role === roleEnum.ADMIN) response.redirect('/users/admin');
        else response.redirect('/auth/user');
      }
    } catch (error) {
      // @ts-ignore
      request.flash('error', [
        { field: 'registration', errors: [(error as Error).message] },
      ]);
      response.render('auth/signup');
    }
  }

  @Post('logout')
  @UseGuards(SessionAuthGuard)
  async logout(@Session() session: any, @Res() response: Response) {
    session.userId = '';

    // @ts-ignore
    response.redirect('/auth/login');
  }
}
