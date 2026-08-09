import { Test, TestingModule } from '@nestjs/testing';
import { ExternalTicketsController } from './external_tickets.controller';
import { ExternalTicketsService } from './external_tickets.service';

describe('ExternalTicketsController', () => {
  let controller: ExternalTicketsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExternalTicketsController],
      providers: [ExternalTicketsService],
    }).compile();

    controller = module.get<ExternalTicketsController>(ExternalTicketsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
