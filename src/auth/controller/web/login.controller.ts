import {
  Controller,
  Get,
  Post,
  Res,
  Session,
  Body,
  UnauthorizedException,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';
import { AuthService } from 'src/auth/auth.service';
import { authPayloadDto } from 'src/auth/dtos/auth-payload.dto';

@Controller('auth')
export class LoginController {
  constructor(private authService: AuthService) {}

  @Get()
  initialPage(@Session() session: any, @Res() response: Response) {
    if (!session.userId) return response.redirect('/auth/login');
  }

  @Get('login')
  login(@Res() response: Response, @Session() session: any) {
    if (session.userId) {
      return response.redirect('/products');
    } else {
      response.render('auth/signin');
    }
  }

  @Post('login')
  // @UseGuards(LocalGuard)
  async loginAction(
    @Res() response: Response,
    @Session() session: any,
    @Body() loginDto: authPayloadDto,
    @Req() request: Request,
  ) {
    try {
      if (session.userId) return response.redirect('/products');

      const user = await this.authService.validateUser({ ...loginDto });

      if (user) {
        session.userId = user.id;

        return response.redirect('/products');
      } else throw new UnauthorizedException('Invalid credential');
    } catch (error) {
      // @ts-ignore
      request.flash('error', (error as Error).message);
      response.render('auth/login');
    }
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleAuthRedirect(
    @Req() req: Request,
    @Res() res: Response,
    @Session() session: any,
  ) {
    const user = req.user as any;

    session.userId = user.id;

    return res.redirect('/products');
  }
}
