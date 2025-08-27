import { Module } from '@nestjs/common';
import { CurrencyController } from './currency.controller';
import { CurrencyService } from './currency.service';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Conversion,
  ConversionSchema,
} from '../schemas/conversion.schema';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forRoot('mongodb+srv://test-user:ObjwnpCmLvHPhuWI@cluster0.ra54a.mongodb.net/currencyconverter'),
    // MongooseModule.forRoot(process.env.MONGO_URI),
    MongooseModule.forFeature([
      { name: Conversion.name, schema: ConversionSchema },
    ]),
  ],
  controllers: [CurrencyController],
  providers: [CurrencyService],
})
export class CurrencyModule {}