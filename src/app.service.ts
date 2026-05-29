import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): Record<string, string> {
    return {
      status: 'ok',
      message: 'Portfolio API is running',
      version: '1.0.0',
    };
  }
}
