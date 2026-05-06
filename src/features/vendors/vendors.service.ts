import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Vendor } from './entities/vendor.entity';

@Injectable()
export class VendorsService {
  constructor(
    @InjectRepository(Vendor) private vendorRepository: Repository<Vendor>,
  ) {}

  async create(dto: CreateVendorDto) {
    return await this.vendorRepository.save(dto);
  }

  async findAll() {
    return await this.vendorRepository.find();
  }

  async findOne(id: number) {
    try {
      return await this.vendorRepository.findOneByOrFail({ id });
    } catch {
      throw new NotFoundException('vendor not found');
    }
  }

  async update(id: number, dto: UpdateVendorDto) {
    const vendor = await this.vendorRepository.findOneBy({ id });
    if (!vendor) throw new NotFoundException('vendor not found');
    this.vendorRepository.merge(vendor, dto);
    return await this.vendorRepository.save(vendor);
  }

  async remove(id: number) {
    const vendor = await this.vendorRepository.findOneBy({ id });
    if (!vendor) throw new NotFoundException('vendor not found');
    return await this.vendorRepository.delete(id);
  }
}
