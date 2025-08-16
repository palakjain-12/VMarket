// test/products.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('ProductController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Register and login to get auth token
    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        shopName: 'Test Shop',
        phone: '1234567890',
      });

    authToken = registerResponse.body.access_token;
  });

  describe('POST /products', () => {
    it('should create a new product', () => {
      return request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Product',
          description: 'A test product',
          price: 10.99,
          quantity: 100,
          category: 'Electronics',
          expiryDate: '2024-12-31',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.name).toBe('Test Product');
        });
    });

    it('should not create product without authentication', () => {
      return request(app.getHttpServer())
        .post('/products')
        .send({
          name: 'Test Product',
          description: 'A test product',
          price: 10.99,
          quantity: 100,
          category: 'Electronics',
        })
        .expect(401);
    });
  });

  describe('GET /products', () => {
    it('should get all products', () => {
      return request(app.getHttpServer())
        .get('/products')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('meta');
        });
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
