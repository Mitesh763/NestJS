import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Address } from './address.entity';
import { Repository } from 'typeorm';
import { CreateAddressDto } from './dtos/create-address.dto';
import { UpdateAddressDto } from './dtos/update-address.dto';
import { User } from 'src/users/user.entity';

@Injectable()
export class AddressService {
  constructor(@InjectRepository(Address) private repo: Repository<Address>) {}

  // get all address by user id
  async findAllByUserId(userId: number) {
    return await this.repo.find({ where: { user: { id: userId } } });
  }

  // find one by address Id
  async findOneByAddressId(id: number, userId: number) {
    return await this.repo.findOne({
      where: { id, user: { id: userId } },
      relations: { user: true },
    });
  }

  //find default address
  async findDefaultOne(userId: number) {
    return this.repo.findOne({
      where: { user: { id: userId }, isDefault: true },
    });
  }

  // create
  async create(addressDetail: CreateAddressDto, user: User) {
    const hasAnyAddress = await this.repo.count({
      where: { user: { id: user.id } },
    });

    let address;
    if (hasAnyAddress > 0)
      address = this.repo.create({
        ...addressDetail,
        user,
      });
    else
      address = this.repo.create({
        ...addressDetail,
        isDefault: true,
        user,
      });
    return await this.repo.save(address);
  }

  // update
  async update(
    id: number,
    userId: number,
    updatedAddressDetail: UpdateAddressDto,
  ) {
    const address = await this.findOneByAddressId(id, userId);

    if (!address) return null;

    Object.assign(address, updatedAddressDetail);

    return await this.repo.save(address);
  }

  // remove
  async remove(id: number, userId: number) {
    const result = await this.repo.softDelete({ id, user: { id: userId } });

    if (result.affected === 0) return null;

    return result;
  }
}
