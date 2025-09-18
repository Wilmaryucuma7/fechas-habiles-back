import request from 'supertest';
import { ExpressApp } from '@/infrastructure/adapters/ExpressApp';
import { Application } from 'express';

describe('Working Date API - Exact Requirements Examples', () => {
  let app: Application;
  let expressApp: ExpressApp;

  beforeAll(() => {
    expressApp = new ExpressApp();
    app = expressApp.getApp();
  });

  afterAll(() => {
    // ExpressApp doesn't have a stop method, but tests will clean up automatically
  });

  describe('GET /working-date', () => {
    it('should handle Friday 5:00 PM + 1 hour -> Monday 9:00 AM Colombia', async () => {
      // Friday January 24, 2025 at 5:00 PM Colombia (10:00 PM UTC)
      const fridayDate = '2025-01-24T22:00:00.000Z';
      
      const response = await request(app)
        .get('/working-date')
        .query({ hours: 1, date: fridayDate })
        .expect(200);

      expect(response.body).toHaveProperty('date');
      
      // Expected: Monday 9:00 AM Colombia = Monday 2:00 PM UTC
      const resultDate = new Date(response.body.date);
      expect(resultDate.getUTCDay()).toBe(1); // Monday
      expect(resultDate.getUTCHours()).toBe(14); // 2:00 PM UTC = 9:00 AM Colombia
    });

    it('should handle Saturday 2:00 PM + 1 hour -> Monday 9:00 AM Colombia', async () => {
      // Saturday January 25, 2025 at 2:00 PM Colombia (7:00 PM UTC)
      const saturdayDate = '2025-01-25T19:00:00.000Z';
      
      const response = await request(app)
        .get('/working-date')
        .query({ hours: 1, date: saturdayDate })
        .expect(200);

      expect(response.body).toHaveProperty('date');
      
      // Expected: Monday 9:00 AM Colombia = Monday 2:00 PM UTC
      const resultDate = new Date(response.body.date);
      expect(resultDate.getUTCDay()).toBe(1); // Monday
      expect(resultDate.getUTCHours()).toBe(14); // 2:00 PM UTC = 9:00 AM Colombia
    });

    it('should handle Tuesday 3:00 PM + 1 day + 3 hours -> Thursday 9:00 AM Colombia', async () => {
      // Tuesday January 21, 2025 at 3:00 PM Colombia (8:00 PM UTC)
      const tuesdayDate = '2025-01-21T20:00:00.000Z';
      
      const response = await request(app)
        .get('/working-date')
        .query({ days: 1, hours: 3, date: tuesdayDate })
        .expect(200);

      expect(response.body).toHaveProperty('date');
      
      // Expected: Thursday 9:00 AM Colombia = Thursday 2:00 PM UTC
      const resultDate = new Date(response.body.date);
      expect(resultDate.getUTCDay()).toBe(4); // Thursday
      expect(resultDate.getUTCHours()).toBe(14); // 2:00 PM UTC = 9:00 AM Colombia
    });

    it('should handle Sunday 6:00 PM + 1 day -> Monday 5:00 PM Colombia', async () => {
      // Sunday January 26, 2025 at 6:00 PM Colombia (11:00 PM UTC)
      const sundayDate = '2025-01-26T23:00:00.000Z';
      
      const response = await request(app)
        .get('/working-date')
        .query({ days: 1, date: sundayDate })
        .expect(200);

      expect(response.body).toHaveProperty('date');
      
      // Expected: Monday 5:00 PM Colombia = Monday 10:00 PM UTC
      const resultDate = new Date(response.body.date);
      expect(resultDate.getUTCDay()).toBe(1); // Monday
      expect(resultDate.getUTCHours()).toBe(22); // 10:00 PM UTC = 5:00 PM Colombia
    });

    it('should handle working day 8:00 AM + 8 hours -> same day 5:00 PM Colombia', async () => {
      // Monday January 20, 2025 at 8:00 AM Colombia (1:00 PM UTC)
      const mondayDate = '2025-01-20T13:00:00.000Z';
      
      const response = await request(app)
        .get('/working-date')
        .query({ hours: 8, date: mondayDate })
        .expect(200);

      expect(response.body).toHaveProperty('date');
      
      // Expected: Same day 5:00 PM Colombia = Monday 10:00 PM UTC
      const resultDate = new Date(response.body.date);
      expect(resultDate.getUTCDay()).toBe(1); // Monday
      expect(resultDate.getUTCHours()).toBe(22); // 10:00 PM UTC = 5:00 PM Colombia
    });

    it('should handle working day 8:00 AM + 1 day -> next working day 8:00 AM Colombia', async () => {
      // Monday January 20, 2025 at 8:00 AM Colombia (1:00 PM UTC)
      const mondayDate = '2025-01-20T13:00:00.000Z';
      
      const response = await request(app)
        .get('/working-date')
        .query({ days: 1, date: mondayDate })
        .expect(200);

      expect(response.body).toHaveProperty('date');
      
      // Expected: Tuesday 8:00 AM Colombia = Tuesday 1:00 PM UTC
      const resultDate = new Date(response.body.date);
      expect(resultDate.getUTCDay()).toBe(2); // Tuesday
      expect(resultDate.getUTCHours()).toBe(13); // 1:00 PM UTC = 8:00 AM Colombia
    });

    it('should handle working day 12:30 PM + 1 day -> next working day 12:00 PM Colombia', async () => {
      // Monday January 20, 2025 at 12:30 PM Colombia (5:30 PM UTC)
      const mondayDate = '2025-01-20T17:30:00.000Z';
      
      const response = await request(app)
        .get('/working-date')
        .query({ days: 1, date: mondayDate })
        .expect(200);

      expect(response.body).toHaveProperty('date');
      
      // Expected: Tuesday 12:00 PM Colombia = Tuesday 5:00 PM UTC
      const resultDate = new Date(response.body.date);
      expect(resultDate.getUTCDay()).toBe(2); // Tuesday
      expect(resultDate.getUTCHours()).toBe(17); // 5:00 PM UTC = 12:00 PM Colombia
    });

    it('should handle working day 11:30 AM + 3 hours -> same day 3:30 PM Colombia', async () => {
      // Monday January 20, 2025 at 11:30 AM Colombia (4:30 PM UTC)
      const mondayDate = '2025-01-20T16:30:00.000Z';
      
      const response = await request(app)
        .get('/working-date')
        .query({ hours: 3, date: mondayDate })
        .expect(200);

      expect(response.body).toHaveProperty('date');
      
      // Expected: Same day 3:30 PM Colombia = Monday 8:30 PM UTC
      const resultDate = new Date(response.body.date);
      expect(resultDate.getUTCDay()).toBe(1); // Monday
      expect(resultDate.getUTCHours()).toBe(20); // 8:30 PM UTC = 3:30 PM Colombia
      expect(resultDate.getUTCMinutes()).toBe(30); // :30 minutes
    });

    it('should handle April 10 2025 + 5 days + 4 hours with holidays -> April 21 3:00 PM Colombia', async () => {
      // April 10, 2025 at 3:00 PM UTC (10:00 AM Colombia)
      const aprilDate = '2025-04-10T15:00:00.000Z';
      
      const response = await request(app)
        .get('/working-date')
        .query({ days: 5, hours: 4, date: aprilDate })
        .expect(200);

      expect(response.body).toHaveProperty('date');
      
      // Expected: April 21, 2025 at 3:00 PM Colombia = April 21, 2025 at 8:00 PM UTC
      const resultDate = new Date(response.body.date);
      expect(resultDate.getUTCMonth()).toBe(3); // April (0-indexed)
      expect(resultDate.getUTCDate()).toBe(21); // April 21
      expect(resultDate.getUTCHours()).toBe(20); // 8:00 PM UTC = 3:00 PM Colombia
    }, 10000); // Extended timeout for holiday API call
  });

  describe('Error Cases', () => {
    it('should return error when no parameters provided', async () => {
      const response = await request(app)
        .get('/working-date')
        .expect(400);

      expect(response.body).toHaveProperty('error', 'InvalidParameters');
      expect(response.body).toHaveProperty('message');
    });

    it('should return error for invalid date format', async () => {
      const response = await request(app)
        .get('/working-date')
        .query({ hours: 1, date: 'invalid-date' })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'InvalidParameters');
    });

    it('should return error for negative values', async () => {
      const response = await request(app)
        .get('/working-date')
        .query({ hours: -1 })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'InvalidParameters');
    });
  });
});
