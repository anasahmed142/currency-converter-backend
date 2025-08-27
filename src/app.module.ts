import { Module } from '@nestjs/common';
import { CurrencyModule } from './currency/currency.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [CurrencyModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}