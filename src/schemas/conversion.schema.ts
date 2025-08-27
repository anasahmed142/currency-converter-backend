import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ConversionDocument = HydratedDocument<Conversion>;

@Schema()
export class Conversion {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  fromCurrency: string;

  @Prop({ required: true })
  toCurrency: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  convertedAmount: number;

  @Prop({ default: Date.now })
  timestamp: Date;
}

export const ConversionSchema = SchemaFactory.createForClass(Conversion);