
import request from 'supertest';
import { startApp } from '../src/app';

let app: any;

beforeAll(async () => {
  app = await startApp();
});

describe('Auth', () => {
  it('registers a user', async () => {
    const res = await request(app).post('/users').send({
      email: `test+${Date.now()}@example.com`,
      password: 'password123',
      firstName: 'Test',
      lastName: 'User'
    });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
  });
});
