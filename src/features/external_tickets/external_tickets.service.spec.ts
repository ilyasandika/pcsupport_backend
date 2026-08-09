import { Test, TestingModule } from '@nestjs/testing';
import { ExternalTicketsService } from './external_tickets.service';

describe('ExternalTicketsService', () => {
  let service: ExternalTicketsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExternalTicketsService],
    }).compile();

    service = module.get<ExternalTicketsService>(ExternalTicketsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
