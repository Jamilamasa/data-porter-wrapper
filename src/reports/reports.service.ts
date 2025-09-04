import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import * as dotenv from 'dotenv';
import { CreateReportDto } from './dto/create-report.dto';
import { Report } from './entities/reports.entities';
import { Readable } from 'stream';
import { JsonLogger } from '../common/logger';

dotenv.config();

@Injectable()
export class ReportsService {
  private readonly baseUrl = process.env.DATA_PORTER_BASE_URL;
  private readonly token = process.env.DATA_PORTER_JWT;

  private get client() {
    return axios.create({
      baseURL: this.baseUrl,
      headers: { Authorization: `Bearer ${this.token}` },
      timeout: Number(process.env.HTTP_TIMEOUT_MS || 15000),
    });
  }

  async createReport(data: CreateReportDto): Promise<Report> {
    try {
      const res = await this.client.post<Report>('/api/export', data);

      JsonLogger.info('Created export job', {
        reference_id: res.data.reference_id,
        status: res.data.status,
      });
      return res.data;
    } catch (err: unknown) {
      JsonLogger.error('Failed to create report', { error: err });
      throw new HttpException(
        { error: err, message: 'Failed to create report' },
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  async getStatus(referenceId: string): Promise<Report> {
    try {
      const res = await this.client.get<Report>(`/api/export/${referenceId}`);
      JsonLogger.info('Fetched export status', {
        referenceId,
        status: res.data.status,
      });
      const { reference_id, status, file_url, error_message } = res.data;
      return { reference_id, status, file_url, error_message };
    } catch (err: unknown) {
      JsonLogger.error('Failed to fetch status', {
        reference_id: referenceId,
        error: err,
      });
      throw new HttpException(
        { error: err, message: 'Failed to fetch status' },
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  async downloadFile(referenceId: string) {
    const statusRes = await this.getStatus(referenceId);

    if (statusRes.status === 'COMPLETED' && statusRes.file_url) {
      JsonLogger.info('Streaming export file', {
        reference_id: referenceId,
        status: statusRes.status,
      });

      const response = await axios.get<Readable>(statusRes.file_url, {
        responseType: 'stream',
      });
      return { status: 'COMPLETED', stream: response.data };
    }

    if (statusRes.status === 'FAILED') {
      JsonLogger.error('Export job failed', {
        reference_id: referenceId,
        status: statusRes.status,
        error_message: statusRes.error_message ?? 'Export failed',
      });

      return {
        status: 'FAILED',
        error_message: statusRes.error_message ?? 'Export failed',
      };
    }

    JsonLogger.info('Export not ready for download', {
      reference_id: referenceId,
      status: statusRes.status,
    });

    return { status: 'PENDING' };
  }
}
