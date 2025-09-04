import { Test, TestingModule } from '@nestjs/testing';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

describe('ReportsController', () => {
  let controller: ReportsController;

  const mockReportsService = {
    createReport: jest.fn(),
    getStatus: jest.fn(),
    downloadFile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportsController],
      providers: [
        {
          provide: ReportsService,
          useValue: mockReportsService,
        },
      ],
    }).compile();

    controller = module.get<ReportsController>(ReportsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call service.createReport', async () => {
    mockReportsService.createReport.mockResolvedValue({
      reference_id: 'mock-1',
      status: 'PENDING',
    });

    const result = await controller.create({
      account_id: '123',
      table_name: 'bank_transactions',
      date_from: '2024-01-01',
      date_to: '2024-01-31',
      force_refresh: false,
    });

    expect(result).toEqual({ reference_id: 'mock-1', status: 'PENDING' });
    expect(mockReportsService.createReport).toHaveBeenCalled();
  });
});
