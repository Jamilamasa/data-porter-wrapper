import { ReportsService } from './reports.service';
import axios from 'axios';
import { Report } from './entities/reports.entities';
import { CreateReportDto } from './dto/create-report.dto';
import { JsonLogger } from '../common/logger';

jest.mock('axios');
jest.mock('../common/logger', () => ({
  JsonLogger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ReportsService', () => {
  let service: ReportsService;

  beforeEach(() => {
    service = new ReportsService();
    mockedAxios.create.mockReturnThis();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a report', async () => {
    mockedAxios.post.mockResolvedValue({
      data: { reference_id: 'abc-123', status: 'PENDING' },
    });

    const dto: CreateReportDto = {
      account_id: '123',
      table_name: 'bank_transactions',
      date_from: '2024-01-01',
      date_to: '2024-01-31',
      force_refresh: false,
    };

    const result = await service.createReport(dto);

    expect(result).toMatchObject({
      reference_id: 'abc-123',
      status: 'PENDING',
    });
    expect(JsonLogger.info).toHaveBeenCalledWith(
      'Created export job',
      expect.objectContaining({ reference_id: 'abc-123', status: 'PENDING' }),
    );
  });

  it('should return FAILED downloadFile result', async () => {
    const getStatusSpy = jest.spyOn(service, 'getStatus');
    getStatusSpy.mockResolvedValue({
      reference_id: 'abc-123',
      status: 'FAILED',
      error_message: 'oops',
    } as Report);

    const result = await service.downloadFile('abc-123');

    expect(result).toEqual({ status: 'FAILED', error_message: 'oops' });
    expect(JsonLogger.error).toHaveBeenCalled();
  });
});
