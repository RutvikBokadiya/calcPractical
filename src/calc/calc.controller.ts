import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CalcService } from './calc.service';
import { CalcDto } from './calc.dto';

@Controller('calc')
export class CalcController {
  constructor(private readonly calcService: CalcService) { }

  @Post('/')
  calc(@Body() calcBody: CalcDto) {
    const result = this.calcService.calculateExpression(calcBody);
    return {
      result,
    };
  }
  @Get('/')
  calcGet() {
    return {
      result: "test",
    };
  }
}
