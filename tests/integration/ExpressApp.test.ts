import request from 'supertest';
import { ExpressApp } from '@/infrastructure/adapters/ExpressApp';

describe('ExpressApp Integration Tests', () => {
  let app: ExpressApp;
  let server: any;

  beforeEach(() => {
    app = new ExpressApp();
    server = app.getApp();
  });

  describe('GET /working-date', () => {
    it('should return error when no parameters provided', async () => {
      const response = await request(server).get('/working-date');
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'InvalidParameters');
      expect(response.body).toHaveProperty('message');
    });

    it('should return error for negative days', async () => {
      const response = await request(server).get('/working-date?days=-1');
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'InvalidParameters');
      expect(response.body.message).toContain('positive integer');
    });

    it('should return error for negative hours', async () => {
      const response = await request(server).get('/working-date?hours=-5');
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'InvalidParameters');
      expect(response.body.message).toContain('positive integer');
    });

    it('should return valid response for days parameter', async () => {
      const response = await request(server).get('/working-date?days=1');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('date');
      expect(response.body.date).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    }, 10000); // 10 second timeout for API call

    it('should return valid response for hours parameter', async () => {
      const response = await request(server).get('/working-date?hours=1');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('date');
      expect(response.body.date).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    }, 10000);

    it('should return valid response for both days and hours', async () => {
      const response = await request(server).get('/working-date?days=1&hours=2');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('date');
      expect(response.body.date).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    }, 10000);

    it('should handle custom start date', async () => {
      const startDate = '2025-09-17T15:00:00.000Z';
      const response = await request(server)
        .get(`/working-date?days=1&date=${encodeURIComponent(startDate)}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('date');
      expect(response.body.date).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    }, 10000);
  });

  describe('GET /invalid-route', () => {
    it('should return 404 for invalid routes', async () => {
      const response = await request(server).get('/invalid-route');
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'NotFound');
      expect(response.body.message).toContain('/invalid-route');
    });
  });

  describe('CORS headers', () => {
    it('should include CORS headers', async () => {
      const response = await request(server)
        .options('/working-date')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'GET')
        .set('Access-Control-Request-Headers', 'content-type');
      
      expect(response.headers['access-control-allow-origin']).toBe('*');
      expect(response.headers['access-control-allow-methods']).toBeDefined();
      expect(response.headers['access-control-allow-headers']).toBeDefined();
    });

    it('should handle OPTIONS request', async () => {
      const response = await request(server).options('/working-date');
      
      expect(response.status).toBe(200);
    });
  });
});
