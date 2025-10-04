import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { authPayloadDto } from './dtos/auth-payload.dto';
import { promisify } from 'util';
import { scrypt as _scrypt, randomBytes } from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { Token } from './auth.entity';
import { Repository } from 'typeorm';
import { CreateTokenDto } from './dtos/create-token.dto';
import { SignUpDto } from './dtos/sign-up.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UpdatePasswordDto } from './dtos/update-password.dto';

const script = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UsersService,
    @InjectRepository(Token) private tokenRepository: Repository<Token>,
  ) {}

  // sign-in (for dashboard)
  async validateUser({ email, password }: authPayloadDto) {
    const findUser = await this.userService.findOneByEmail(email);

    if (!findUser) throw new UnauthorizedException('Invalid Credentials');

    const [salt, storedPassword] = findUser.password.split('.');
    const newPasswordHash = (await script(password, salt, 32)) as Buffer;
    const hashedPassword = newPasswordHash.toString('hex');

    if (storedPassword === hashedPassword) {
      const { password, ...user } = findUser;

      return user;
    }

    return null;
  }

  // Sign-up ( for dashboard )
  async createNewUser(body: SignUpDto) {
    // const user = await this.userService.findOneByEmail(body.email);

    // if (user)
    //   throw new ConflictException('Email already exist, Try with another!');

    const newUser = await this.userService.createUser(body);

    if (!newUser) throw new ConflictException('Unexpected error occurred!');

    return newUser;
  }

  // signup with generating accessToken (for API)
  async signupWithGenerateToken(signupDto: SignUpDto) {
    const user = await this.createNewUser(signupDto);

    const accessToken = await this.generateToken(user);

    return { ...user, accessToken: accessToken };
  }

  //get one by user email
  findByEmail(email: string) {
    return this.userService.findOneByEmail(email);
  }

  // Find one by user Id
  findById(id: number) {
    return this.userService.findOneById(id);
  }

  // find or create google user
  async findOrCreateGoogleUser(userData: any) {
    let user = await this.userService.findOneByEmail(userData.email);

    if (!user) {
      let dbUser: {
        email: string;
        name: string;
        password: string;
        phone_number: string;
      } = {
        email: '',
        name: '',
        password: '',
        phone_number: '',
      };
      
      dbUser.email = userData.email;
      dbUser.name = userData.firstName + ' ' + userData.lastName;

      user = await this.userService.createUser(dbUser);
    }
    return user;
  }

  // Update user
  async updateUser(id: number, updateUserDetail: UpdateUserDto) {
    return await this.userService.update(id, updateUserDetail);
  }

  // change password
  async changePassword(id: number, passwordDetail: UpdatePasswordDto) {
    return await this.userService.changePassword(id, passwordDetail);
  }

  // store in DB (for API)
  private async saveToken(tokenDetail: CreateTokenDto) {
    const newToken = this.tokenRepository.create(tokenDetail);
    return await this.tokenRepository.save(newToken);
  }

  // generate token (for API)
  private async generateToken(user: any) {
    const payload = { id: user.id };

    const accessToken = this.jwtService.sign(payload);

    const salt = randomBytes(8).toString('hex');
    const hashedToken = (await script(accessToken, salt, 32)) as Buffer;

    const newAccessToken = salt + '.' + hashedToken.toString('hex');

    const expirationTime = process.env.JWT_EXPIRATION_TIME!;
    const expired_at = new Date();
    if (expirationTime.includes('h'))
      expired_at.setHours(expired_at.getHours() + parseInt(expirationTime));
    else if (expirationTime.includes('d'))
      expired_at.setDate(expired_at.getDate() + parseInt(expirationTime));
    else
      expired_at.setMinutes(expired_at.getMinutes() + parseInt(expirationTime));

    // save to db
    await this.saveToken({
      user,
      token: newAccessToken,
      expired_at,
    });

    return accessToken;
  }

  // validating token with DB (for API)
  async isTokenValid(id: number, token: string) {
    const tokenRecords = await this.tokenRepository.find({
      where: { user: { id } },
    });

    if (!tokenRecords || tokenRecords.length === 0) return false;

    for (const dataToken of tokenRecords) {
      if (dataToken.revoked) continue;

      if (new Date() > dataToken.expired_at) continue;

      const [salt, storedToken] = dataToken.token.split('.');
      const hashedToken = (await script(token, salt, 32)) as Buffer;
      if (storedToken === hashedToken.toString('hex')) return true;
    }

    return false;
  }

  // update user profile picture
  async updateUserProfile(id: number, filePath: string) {
    return await this.userService.updateUserProfile(id, filePath);
  }

  // Revoke token (signout) by auth and token (for API)
  async revokeToken(id: number, token: string) {
    const tokenRecords = await this.tokenRepository.find({
      where: { userId: id },
    });

    if (!tokenRecords || tokenRecords.length === 0) return false;

    for (const dataToken of tokenRecords) {
      if (dataToken.revoked) continue;

      if (new Date() > dataToken.expired_at) continue;

      const [salt, storedToken] = dataToken.token.split('.');
      const hashedToken = (await script(token, salt, 32)) as Buffer;

      if (storedToken === hashedToken.toString('hex')) {
        dataToken.revoked = true;
        await this.tokenRepository.save(dataToken);

        return true;
      }
    }

    return false;
  }

  // revoked token by userID (for API)
  async revokedTokenByUserID(userId: number) {
    await this.tokenRepository.update({ userId }, { revoked: true });
  }

  // delete user
  async deleteUser(id: number) {
    this.revokedTokenByUserID(id);
    return await this.userService.delete(id);
  }
}
