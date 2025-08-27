import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { firstValueFrom } from 'rxjs';
import { Conversion, ConversionDocument } from '../schemas/conversion.schema';

@Injectable()
export class CurrencyService {
  constructor(
    private readonly httpService: HttpService,
    @InjectModel(Conversion.name)
    private conversionModel: Model<ConversionDocument>,
  ) {}

  async getSupportedCurrencies() {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `https://api.freecurrencyapi.com/v1/currencies?apikey=${process.env.API_KEY}`,
        ),
      );
      return response.data.data;
    } catch (error) {
      console.error('Backend: Failed to fetch supported currencies', error);
      throw new InternalServerErrorException(
        'Failed to fetch supported currencies',
      );
    }
  }

  async convertCurrency(
    from: string,
    to: string,
    amount: number,
    userId: string
  ): Promise<Conversion> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `https://api.freecurrencyapi.com/v1/latest?apikey=${process.env.API_KEY}&base_currency=${from}&currencies=${to}`,
        ),
      );
      const exchangeRate = response.data.data[to];
      const convertedAmount = amount * exchangeRate;
      
      const conversionRecord = await this.conversionModel.create({
        fromCurrency: from,
        toCurrency: to,
        amount,
        userId,
        convertedAmount,
      });

      return conversionRecord;
    } catch (error) {
      console.error('Backend: Failed  to convert currency or save record', error);
      throw new InternalServerErrorException(
        'Failed to convert currency or save record',
      );
    }
  }

  async getConversionHistory(userId: string) {
    const history = await this.conversionModel.find({ userId }).sort({ timestamp: -1 }).exec();
    return history;
  }
}