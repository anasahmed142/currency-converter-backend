import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Conversion } from '../src/schemas/conversion.schema';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';

// Mock the freecurrencyapi response
const mockCurrencyApi = {
  get: (url: string) => {
    if (url.includes('latest')) {
      return of({
        data: {
          data: {
            "USD": 1,
            "EUR": 0.92,
            "JPY": 156.45
          }
        }
      });
    } else {
      return of({
        data: {
          data: {
            "USD": { "symbol_native": "$", "decimal_digits": 2, "name": "US Dollar", "name_plural": "US dollars", "code": "USD", "symbol": "$" },
            "EUR": { "symbol_native": "€", "decimal_digits": 2, "name": "Euro", "name_plural": "Euros", "code": "EUR", "symbol": "€" },
            "JPY": { "symbol_native": "￥", "decimal_digits": 0, "name": "Japanese Yen", "name_plural": "Japanese yen", "code": "JPY", "symbol": "￥" },
          },
        },
      });
    }
  }
};

const mockConversionModel = {
  // Mock the find method to return a chainable object with a sort method that returns a mock exec method
  find: jest.fn(() => ({
    sort: jest.fn(() => ({
      exec: jest.fn().mockResolvedValue([])
    }))
  })),
  create: jest.fn().mockResolvedValue({
    fromCurrency: 'USD',
    toCurrency: 'EUR',
    amount: 10,
    userId: 'test-user-1',
    convertedAmount: 9.2,
    timestamp: new Date(),
  }),
};
describe('CurrencyController (e2e)', () => {
  let app: INestApplication;
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(HttpService)
      .useValue(mockCurrencyApi)
      .overrideProvider(getModelToken(Conversion.name))
      .useValue(mockConversionModel)
      .compile();
    app = moduleFixture.createNestApplication();
    await app.init();
  });
  it('/currency/list (GET) - should return a list of supported currencies', async () => {
    const response = await request(app.getHttpServer())
      .get('/currency/list')
      .expect(200);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty('USD');
    expect(response.body).toHaveProperty('EUR');
    expect(response.body).toHaveProperty('JPY');
  });

  it('/currency/convert (POST) - should perform a conversion and save with userId', async () => {
    const conversionData = {
      from: 'USD',
      to: 'EUR',
      amount: 10,
      userId: 'test-user-1',
    };
    const response = await request(app.getHttpServer())
      .post('/currency/convert')
      .send(conversionData)
      .expect(201);
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toHaveProperty('fromCurrency', 'USD');
    expect(response.body).toHaveProperty('toCurrency', 'EUR');
    expect(response.body).toHaveProperty('amount', 10);
    expect(response.body).toHaveProperty('userId', 'test-user-1');
    expect(response.body).toHaveProperty('convertedAmount');
    expect(mockConversionModel.create).toHaveBeenCalled();
  });
  it('/currency/history (GET) - should return the conversion history for a specific user', async () => {
    const testUserId = 'test-user-1';
    // Mock the find method to return a chainable object with a sort mock that returns a mock exec method
    const findMock = {
      sort: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([
          {
            fromCurrency: 'USD',
            toCurrency: 'EUR',
            amount: 10,
            convertedAmount: 9.2,
            userId: testUserId,
            timestamp: new Date(),
          },
        ]),
      }),
    };
    mockConversionModel.find.mockReturnValue(findMock);
    const response = await request(app.getHttpServer())
      .get(`/currency/history?userId=${testUserId}`)
      .expect(200);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0]).toHaveProperty('fromCurrency', 'USD');
    expect(response.body[0]).toHaveProperty('userId', testUserId);
    // Verify that the mocked find function was called with the correct query
    expect(mockConversionModel.find).toHaveBeenCalledWith({ userId: testUserId });
  });

  afterAll(async () => {
    await app.close();
  });
});
