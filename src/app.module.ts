import { Module } from '@nestjs/common';
import { CurrencyModule } from './currency/currency.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true,
  }), CurrencyModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }