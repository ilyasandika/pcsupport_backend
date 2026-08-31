import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Vendor } from './entities/vendor.entity';
import { plainToInstance } from 'class-transformer';
import { VendorResponseDto } from './dto/vendor-response.dto';

@Injectable()
export class VendorsService {
  constructor(
    @InjectRepository(Vendor) private vendorRepository: Repository<Vendor>,
  ) {}

  async create(dto: CreateVendorDto) {
    const newVendor = this.vendorRepository.create(dto);
    const saved = await this.vendorRepository.save(newVendor);
    return plainToInstance(VendorResponseDto, saved);
  }

  async findAll() {
    const vendors = await this.vendorRepository.find();
    return plainToInstance(VendorResponseDto, vendors);
  }

  async findOne(id: number) {
    try {
      const vendor = await this.vendorRepository.findOneOrFail({
        where: { id },
      });
      return plainToInstance(VendorResponseDto, vendor);
    } catch {
      throw new NotFoundException('vendor not found');
    }
  }

  async update(id: number, dto: UpdateVendorDto) {
    const vendor = await this.vendorRepository.findOneBy({ id });
    if (!vendor) throw new NotFoundException('vendor not found');
    this.vendorRepository.merge(vendor, dto);
    const saved = await this.vendorRepository.save(vendor);
    return plainToInstance(VendorResponseDto, saved);
  }

  async remove(id: number) {
    const vendor = await this.vendorRepository.findOne({
      where: { id },
      relations: { projects: true },
    });
    if (!vendor) throw new NotFoundException('vendor not found');
    if (vendor.projects && vendor.projects.length > 0) {
      throw new BadRequestException(
        'Vendor cannot be deleted because it is associated with one or more projects',
      );
    }
    return await this.vendorRepository.delete(id);
  }
}
