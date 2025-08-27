import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CurrencyService } from './currency.service';
@Controller('currency')
@UsePipes(new ValidationPipe())
export class CurrencyController {
  constructor(private readonly currencyService: CurrencyService) {}
  @Get('list')
  getSupportedCurrencies() {
    return this.currencyService.getSupportedCurrencies();
  }
  @Post('convert')
  convertCurrency(@Body() body: { from: string; to: string; amount: number; userId: string }) {
    return this.currencyService.convertCurrency(
      body.from,
      body.to,
      body.amount,
      body.userId,
    );
  }
  @Get('history')
  getConversionHistory(@Query('userId') userId: string) {
    return this.currencyService.getConversionHistory(userId);
  }
}