import { Controller, Get, Render, Res, Session } from '@nestjs/common';
import { AppService } from './app.service';
import type { Response } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // @Get()
  // initialPage(@Session() session: any, @Res() response: Response) {
  //   if (!session.userId) return response.redirect('/auth/login');
  // }

  @Get()
  initial() {
    // return 'hello';
  }
}
