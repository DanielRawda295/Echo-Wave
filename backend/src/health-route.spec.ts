import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { MODULE_METADATA } from '@nestjs/common/constants';
import { AppModule } from './app.module';

describe('Render HTTP health check', () => {
  let app: INestApplication;
  afterEach(async () => { await app?.close(); });

  it('registers the health controller and serves the configured /api path', async () => {
    // Use root-module registrations so removing the controller reproduces the failure.
    const module = await Test.createTestingModule({
      controllers: Reflect.getMetadata(MODULE_METADATA.CONTROLLERS, AppModule),
      providers: Reflect.getMetadata(MODULE_METADATA.PROVIDERS, AppModule),
    }).compile();
    app = module.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
    await request(app.getHttpServer()).get('/api').expect(200).expect('Hello World!');
  });
});
