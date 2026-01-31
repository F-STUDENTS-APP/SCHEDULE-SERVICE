import request from 'supertest';
import app from '../app';

describe('Schedule Service Health Check', () => {
  it('should return 200 status', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
  });

  it('should return UP status', async () => {
    const response = await request(app).get('/health');
    expect(response.body).toHaveProperty('status', 'UP');
  });

  it('should include service name', async () => {
    const response = await request(app).get('/health');
    expect(response.body).toHaveProperty('service');
  });
});
