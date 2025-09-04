import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Res,
  HttpException,
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
    const fileStream = await this.reportsService.downloadFile(referenceId);
    if (!fileStream) {
      throw new HttpException({ status: 'PENDING' }, HttpStatus.CONFLICT);
    }
    res.setHeader('Content-Type', 'text/csv');
    fileStream.pipe(res);
  }
}
