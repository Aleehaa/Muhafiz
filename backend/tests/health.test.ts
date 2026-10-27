import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../src/app';
import * as prismaModule from '../src/database/prisma';

describe('Health & Readiness API Endpoints', () => {
  test('GET /api/v1/health should return 200 OK with system status', async () => {
    const res = await request(app).get('/api/v1/health');

    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'ok');
    assert.equal(res.body.service, 'Mohafiz Case Desk API');
    assert.ok(typeof res.body.uptime === 'number');
    assert.ok(typeof res.body.timestamp === 'string');
    assert.ok(res.body.environment);
  });

  test('GET /api/v1/health/ready should return 200 OK when database is reachable', async () => {
    const res = await request(app).get('/api/v1/health/ready');

    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'ok');
    assert.equal(res.body.service, 'Mohafiz Case Desk API');
    assert.equal(res.body.database.status, 'ready');
    assert.ok(typeof res.body.database.latencyMs === 'number');
    assert.ok(res.body.database.latencyMs >= 0);
  });

  test('GET /api/v1/health/ready should return 503 Service Unavailable when database fails', async () => {
    const { HealthService } = await import('../src/modules/health/health.service');
    const originalGetReadiness = HealthService.getReadiness;

    HealthService.getReadiness = async () => ({
      status: 'error',
      service: 'Mohafiz Case Desk API',
      version: '1.0.0',
      environment: 'test',
      timestamp: new Date().toISOString(),
      database: {
        status: 'disconnected',
        error: 'Database connection error',
      },
    });

    try {
      const res = await request(app).get('/api/v1/health/ready');

      assert.equal(res.status, 503);
      assert.equal(res.body.status, 'error');
      assert.equal(res.body.database.status, 'disconnected');
      assert.equal(res.body.database.error, 'Database connection error');
      // Ensure no credentials or connection strings are present
      assert.equal(JSON.stringify(res.body).includes('password'), false);
      assert.equal(JSON.stringify(res.body).includes('postgresql://'), false);
    } finally {
      HealthService.getReadiness = originalGetReadiness;
    }
  });

  test('GET /unknown-route should return 404', async () => {
    const res = await request(app).get('/api/v1/unknown');

    assert.equal(res.status, 404);
    assert.equal(res.body.success, false);
    assert.equal(res.body.error.code, 'NOT_FOUND');
  });
});
