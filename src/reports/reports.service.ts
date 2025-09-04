import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import * as dotenv from 'dotenv';
import { CreateReportDto } from './dto/create-report.dto';
import { Report } from './entities/reports.entities';
import { Readable } from 'stream';

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
      return res.data;
    } catch (err: unknown) {
      throw new HttpException(
        { error: err, message: 'Failed to create report' },
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  async getStatus(referenceId: string): Promise<Report> {
    try {
      const res = await this.client.get<Report>(`/api/export/${referenceId}`);

      const { reference_id, status, file_url, error_message } = res.data;
      return { reference_id, status, file_url, error_message };
    } catch (err: unknown) {
      throw new HttpException(
        { error: err, message: 'Failed to fetch status' },
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  async downloadFile(referenceId: string) {
    const statusRes = await this.getStatus(referenceId);
    if (statusRes.status !== 'COMPLETED' || !statusRes.file_url) {
      return null;
    }

    const fileUrl = statusRes.file_url;
    const response = await axios.get<Readable>(fileUrl, {
      responseType: 'stream',
    });
    return response.data;
  }
}
