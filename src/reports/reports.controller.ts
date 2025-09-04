import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import type { Response } from 'express';

@Controller('report')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  async create(@Body() body: CreateReportDto) {
    return this.reportsService.createReport(body);
  }

  @Get(':referenceId')
  async getStatus(@Param('referenceId') referenceId: string) {
    return this.reportsService.getStatus(referenceId);
  }

  @Get(':referenceId/download')
  async download(
    @Param('referenceId') referenceId: string,
    @Res() res: Response,
  ) {
    const result = await this.reportsService.downloadFile(referenceId);

    switch (result.status) {
      case 'COMPLETED':
        res.setHeader('Content-Type', 'text/csv');
        return result.stream?.pipe(res);

      case 'FAILED':
        return res.status(HttpStatus.CONFLICT).json({
          status: 'FAILED',
          error_message: result.error_message,
        });

      case 'PENDING':
        return res.status(HttpStatus.CONFLICT).json({ status: 'PENDING' });
    }
  }
}
