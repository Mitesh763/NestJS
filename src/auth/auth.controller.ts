import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  NotFoundException,
  ParseFilePipeBuilder,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalGuard } from './guards/local.guard';
import { JwtAuthGuard } from './guards/jwt.guard';
import { SignUpDto } from './dtos/sign-up.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UpdatePasswordDto } from './dtos/update-password.dto';
import { Serialize } from 'src/Interceptors/serialize.interceptor';
import { AuthUserDto } from './dtos/auth-user.dto';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { User } from 'src/users/user.entity';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // sign-up
  @Post('signup')
  @Serialize(AuthUserDto)
  async createNewUser(@Body() body: SignUpDto) {
    return await this.authService.signupWithGenerateToken(body);
  }

  // sign-in
  @Post('signin')
  @UseGuards(LocalGuard)
  @Serialize(AuthUserDto)
  async signIn(@Req() req: any) {
    // @ts-ignore
    const token = await this.authService.generateToken(req.user);

    return { ...req.user, accessToken: token };
  }

  // user profile
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async showProfile(@CurrentUser() user: User) {
    return user;
  }

  @Post('profile-picture')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('profile'))
  async updateUserProfile(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({ maxSize: 1000 * 1024 })
        .build(),
    )
    file: Express.Multer.File,
    @CurrentUser() user: User,
  ) {
    if (!file) throw new NotFoundException('File not found!');

    const filePath = file.filename;

    const result = await this.authService.updateUserProfile(user.id, filePath);

    if (!result) throw new ConflictException('Unexpected error occurred!');

    return {
      message: 'Profile picture updated successfully',
      path: filePath,
    };
  }

  // user - change password
  @Patch('change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @CurrentUser() user: User,
    @Body() body: UpdatePasswordDto,
  ) {
    const result = await this.authService.changePassword(user.id, body);

    if (!result) throw new BadRequestException('Password does not match!');

    return { message: 'Password updated successfully.' };
  }

  // sign-out [auth/own profile]
  @Get('signout')
  @UseGuards(JwtAuthGuard)
  async signOut(@Req() req: any) {
    const id = req.user.id;
    const token = req.headers['authorization'].split(' ')[1];

    const result = await this.authService.revokeToken(id, token);

    if (!result) return { message: 'Unauthorized!' };
    else return { message: 'Signout successfully.' };
  }

  // Update User [auth/own profile]
  @Patch()
  @UseGuards(JwtAuthGuard)
  async update(@CurrentUser() user: User, @Body() body: UpdateUserDto) {
    if (!body || Object.keys(body).length === 0)
      throw new BadRequestException('Update attribute can not be empty!');

    if (body.email) {
      const userExist = await this.authService.findByEmail(body.email);
      if (!userExist) throw new ConflictException('Email already exist!');
    }

    const result = await this.authService.updateUser(user.id, body);

    if (!result) throw new NotFoundException('User not found!');

    return { message: 'User updated successfully.' };
  }

  // Delete User [auth/own profile]
  @Delete()
  @UseGuards(JwtAuthGuard)
  async remove(@CurrentUser() user: User) {
    const result = await this.authService.deleteUser(user.id);

    if (!result) throw new NotFoundException('User not found!');

    return { message: 'User deleted successfully.' };
  }
}
