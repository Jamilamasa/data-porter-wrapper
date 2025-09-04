import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest'; 
import { ReportsModule } from './reports.module';
import { ReportsService } from './reports.service';

describe('ReportsController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ReportsModule],
    })
      .overrideProvider(ReportsService)
      .useValue({
        createReport: jest.fn().mockResolvedValue({
          reference_id: 'mock-123',
          status: 'PENDING',
        }),
        getStatus: jest.fn().mockResolvedValue({
          reference_id: 'mock-123',
          status: 'FAILED',
          error_message: 'db error',
        }),
        downloadFile: jest.fn().mockResolvedValue({
          status: 'FAILED',
          error_message: 'db error',
        }),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/report (POST)', async () => {
    await request(app.getHttpServer())
      .post('/report')
      .send({
        account_id: '123',
        table_name: 'bank_transactions',
        date_from: '2024-01-01',
        date_to: '2024-01-31',
        force_refresh: false,
      })
      .expect(201)
      .expect({
        reference_id: 'mock-123',
        status: 'PENDING',
      });
  });

  it('/report/:id (GET)', async () => {
    await request(app.getHttpServer())
      .get('/report/mock-123')
      .expect(200)
      .expect({
        reference_id: 'mock-123',
        status: 'FAILED',
        error_message: 'db error',
      });
  });

  it('/report/:id/download (GET)', async () => {
    await request(app.getHttpServer())
      .get('/report/mock-123/download')
      .expect(409)
      .expect({ status: 'FAILED', error_message: 'db error' });
  });
});
