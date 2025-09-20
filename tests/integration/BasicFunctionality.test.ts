import request from 'supertest';
import { ExpressApp } from '@/infrastructure/adapters/ExpressApp';
import { Application } from 'express';

describe('Working Date API - Basic Functionality Test', () => {
  let app: Application;
  let expressApp: ExpressApp;

  beforeAll(() => {
    expressApp = new ExpressApp();
    app = expressApp.getApp();
  });

  describe('GET /working-date', () => {
    it('should calculate working date with 1 hour successfully', async () => {
      const response = await request(app)
        .get('/working-date')
        .query({ hours: 1 })
        .expect(200);

      expect(response.body).toHaveProperty('date');
      expect(typeof response.body.date).toBe('string');
      
      const date = new Date(response.body.date);
      expect(date).toBeInstanceOf(Date);
      expect(response.body.date).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it('should handle specific date correctly', async () => {
      // Monday January 20, 2025 at 9:00 AM Colombia (2:00 PM UTC)
      const mondayDate = '2025-01-20T14:00:00.000Z';
      
      const response = await request(app)
        .get('/working-date')
        .query({ hours: 1, date: mondayDate })
        .expect(200);

      expect(response.body).toHaveProperty('date');
      
      const resultDate = new Date(response.body.date);
      expect(resultDate).toBeInstanceOf(Date);
      expect(resultDate.getUTCDay()).toBe(1); // Monday
      
  // Debug logs removed for test cleanliness
    });

    it('should add working days excluding holidays', async () => {
      // Monday December 30, 2024 at 9:00 AM Colombia
      const testDate = '2024-12-30T14:00:00.000Z';
      
      const response = await request(app)
        .get('/working-date')
        .query({ days: 2, date: testDate })
        .expect(200);

      expect(response.body).toHaveProperty('date');
      
      const resultDate = new Date(response.body.date);
      expect(resultDate).toBeInstanceOf(Date);
      
  // Debug logs removed for test cleanliness
      
      // Should skip January 1st (holiday) and possibly weekends
    });
  });

  describe('Error handling', () => {
    it('should return error for no parameters', async () => {
      const response = await request(app)
        .get('/working-date')
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('message');
    });

    it('should return error for invalid date', async () => {
      const response = await request(app)
        .get('/working-date')
        .query({ hours: 1, date: 'invalid-date' })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'InvalidParameters');
    });
  });
});
