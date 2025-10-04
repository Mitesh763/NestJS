import {
  Body,
  ConflictException,
  Controller,
  Get,
  Put,
  Res,
  UseGuards,
  Session,
  Delete,
  NotFoundException,
  ParseFilePipeBuilder,
  UploadedFile,
  UseInterceptors,
  Post,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request, Response } from 'express';
import { AuthService } from 'src/auth/auth.service';
import { UpdateUserDto } from 'src/auth/dtos/update-user.dto';
import { SessionAuthGuard } from 'src/auth/guards/session-auth.guard';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { User } from 'src/users/user.entity';

@Controller('auth')
@UseGuards(SessionAuthGuard)
export class AuthUserController {
  constructor(private readonly authService: AuthService) {}

  @Get('user')
  userDashboard(
    @Res() response: Response,
    @Session() session: any,
    @CurrentUser() user: any,
  ) {
    if (session.userId)
      response.render('auth/user', {
        pageTitle: 'User Dashboard',
        user,
      });
    else response.render('auth/login');
  }

  @Get('profile')
  userProfile(@CurrentUser() user: any, @Res() response: Response) {
    response.render('auth/profile', {
      pageTitle: 'My Profile',
      user,
    });
  }

  @Get('update-profile')
  async updateProfile(@CurrentUser() user: any, @Res() response: Response) {
    const profile = await this.authService.findById(user.id);

    response.render('auth/update', {
      pageTitle: 'Update Profile',
      data: profile,
      user,
    });
  }

  @Put('update-profile')
  async updateProfileAction(
    @Body() updateAuthUserDto: UpdateUserDto,
    @CurrentUser() user: any,
    @Res() response: Response,
    @Req() request: Request,
  ) {
    if (updateAuthUserDto.email) {
      const userExist = await this.authService.findByEmail(
        updateAuthUserDto.email,
      );
      if (!userExist) throw new ConflictException('Email already exist!');
    }

    const result = await this.authService.updateUser(
      user.id,
      updateAuthUserDto,
    );

    //@ts-ignore
    request.flash('success', 'Profile Updated Successfully');
    response.redirect('/auth/profile');
  }

  @Get('profile-picture')
  async updateProfilePicture(
    @Res() response: Response,
    @CurrentUser() user: User,
  ) {
    response.render('auth/profile-picture', {
      pageTitle: 'Change Profile Picture',
      user,
    });
  }

  @Post('profile-picture')
  @UseInterceptors(FileInterceptor('profile'))
  async updateUserProfile(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({ maxSize: 1000 * 1024 })
        .build(),
    )
    file: Express.Multer.File,
    @CurrentUser() user: User,
    @Res() response: Response,
    @Req() request: Request,
  ) {
    if (!file) throw new NotFoundException('File not found!');

    const filePath = file.filename;

    const result = await this.authService.updateUserProfile(user.id, filePath);

    // @ts-ignore
    request.flash('success', 'Profile Picture Updated Successfully');
    response.redirect('/auth/profile');
  }

  @Delete()
  async removeAccount(
    @Session() session: any,
    @CurrentUser() user: User,
    @Res() response: Response,
  ) {
    session.userId = '';
    await this.authService.deleteUser(user.id);
    response.redirect('/auth/signup');
  }
}
