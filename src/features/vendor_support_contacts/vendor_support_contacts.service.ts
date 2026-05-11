import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateVendorSupportContactDto } from './dto/create-vendor_support_contact.dto';
import { UpdateVendorSupportContactDto } from './dto/update-vendor_support_contact.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { VendorSupportContact } from './entities/vendor_support_contact.entity';
import { Repository } from 'typeorm';

@Injectable()
export class VendorSupportContactsService {
  constructor(
    @InjectRepository(VendorSupportContact)
    private readonly vendorSupportContactRepository: Repository<VendorSupportContact>,
  ) {}

  async create(dto: CreateVendorSupportContactDto) {
    return await this.vendorSupportContactRepository.save(dto);
  }

  async findAllByVendorId(vendorId: number) {
    return await this.vendorSupportContactRepository.findBy({ vendorId });
  }

  async findAll() {
    return await this.vendorSupportContactRepository.find({
      order: {
        vendorId: 'ASC',
      },
      relations: {
        vendor: true,
      },
    });
  }

  async findOne(id: number) {
    try {
      return await this.vendorSupportContactRepository.findOneOrFail({
        where: { id: id },
        relations: {
          vendor: true,
        },
      });
    } catch {
      throw new NotFoundException('not found');
    }
  }

  async update(id: number, dto: UpdateVendorSupportContactDto) {
    const contact = await this.vendorSupportContactRepository.findOneBy({ id });
    if (!contact) throw new NotFoundException('not found');
    this.vendorSupportContactRepository.merge(contact, dto);
    return await this.vendorSupportContactRepository.save(contact);
  }

  async remove(id: number) {
    const contact = await this.vendorSupportContactRepository.findOneBy({ id });
    if (!contact) throw new NotFoundException('not found');
    return await this.vendorSupportContactRepository.delete({ id });
  }
}
