import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dtos/create-user.dto';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UpdatePasswordDto } from './dtos/update-password.dto';
import { paginate, Paginated, PaginateQuery } from 'nestjs-paginate';

const script = promisify(_scrypt);

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  // Find All
  findAll(query: PaginateQuery): Promise<Paginated<User>> {
    return paginate(query, this.userRepository, {
      sortableColumns: ['role'],

      searchableColumns: ['email', 'name', 'phone_number', 'id', 'role'],

      defaultLimit: 10,
    });
  }

  // CREATE:  sign-up
  async createUser(createUserDetail: CreateUserDto) {
    if (createUserDetail.password) {
      const salt = randomBytes(8).toString('hex');
      const hash = (await script(
        createUserDetail.password,
        salt,
        32,
      )) as Buffer;
      const result = salt + '.' + hash.toString('hex');

      createUserDetail.password = result;
    }

    const user = this.userRepository.create(createUserDetail);

    const newUser = this.userRepository.save(user);

    return newUser;
  }

  // Find One: find user by email
  async findOneByEmail(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });

    return !user ? null : user;
  }

  // find by Id
  async findOneById(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });

    return !user ? null : user;
  }

  // Update user
  async update(id: number, updateUserDetail: UpdateUserDto) {
    const user = await this.findOneById(id);

    if (!user) return null;

    Object.assign(user, updateUserDetail);

    return this.userRepository.save(user);
  }

  // update password
  async changePassword(id: number, passwordDetail: UpdatePasswordDto) {
    const user = await this.findOneById(id);

    if (!user) throw new NotFoundException('User not found!');

    const [storedSalt, storedPassword] = user.password.split('.');
    const passwordHashWithOld = (await script(
      passwordDetail.oldPassword,
      storedSalt,
      32,
    )) as Buffer;
    const hashedPasswordWithOld = passwordHashWithOld.toString('hex');

    if (hashedPasswordWithOld !== storedPassword) return null;

    const newSalt = randomBytes(8).toString('hex');
    const newHashPassword = (await script(
      passwordDetail.newPassword,
      newSalt,
      32,
    )) as Buffer;
    const newPassword = newHashPassword.toString('hex');

    user.password = `${newSalt}.${newPassword}`;

    return await this.userRepository.save(user);
  }

  // update user profile picture
  async updateUserProfile(id: number, filePath: string) {
    const user = await this.findOneById(id);

    if (!user) throw new NotFoundException('User not found!');

    user.profile = filePath;
    return await this.userRepository.save(user);
  }

  // remove user
  async delete(id: number) {
    const result = await this.userRepository.softDelete(id);

    return result.affected === 0 ? null : result;
  }
}
