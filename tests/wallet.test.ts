
import request from 'supertest';
import { startApp } from '../src/app';

let app: any;

beforeAll(async () => {
  app = await startApp();
});

describe('Wallet', () => {
  it('returns 401 for wallet without token', async () => {
    const res = await request(app).get('/wallets');
    expect(res.status).toBe(401);
  });
});
