import { Controller, Get, Response } from '@nestjs/common';
import { register } from 'prom-client';

@Controller('metrics')
export class MetricsController {
  @Get()
  async metrics(@Response() res) {
    res.set('Content-Type', register.contentType);
    res.send(await register.metrics());
  }
}
