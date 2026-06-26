import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SlaPolicy } from './entities/sla-policy.entity';
import { CreateSlaPolicyDto } from './dto/create-sla-policy.dto';
import { UpdateSlaPolicyDto } from './dto/update-sla-policy.dto';

@Injectable()
export class SlaPoliciesService {
  constructor(
    @InjectRepository(SlaPolicy)
    private readonly slaPolicyRepository: Repository<SlaPolicy>,
  ) {}

  async create(dto: CreateSlaPolicyDto) {
    const newPolicy = this.slaPolicyRepository.create(dto);
    return await this.slaPolicyRepository.save(newPolicy);
  }

  async findAll() {
    return await this.slaPolicyRepository.find();
  }

  async findOne(id: number) {
    const sla = await this.slaPolicyRepository.findOneBy({ id });
    if (!sla) throw new NotFoundException(`SLA Policy not found`);
    return sla;
  }

  async update(id: number, dto: UpdateSlaPolicyDto) {
    const sla = await this.findOne(id);
    this.slaPolicyRepository.merge(sla, dto);
    return await this.slaPolicyRepository.save(sla);
  }

  async remove(id: number) {
    const policy = await this.findOne(id);
    await this.slaPolicyRepository.remove(policy);
    return { message: `SLA Policy Deleted` };
  }
}
