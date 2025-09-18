const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');

const MONGODB_URI = process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/task_manager_test';

beforeAll(async () => {
  await mongoose.connect(MONGODB_URI);
});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.disconnect();
});

describe('Auth endpoints', () => {
  it('should signup a new user', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ email: 'test@example.com', password: 'password123' })
      .expect(201);

    expect(res.body.token).toBeTruthy();
    expect(res.body.user.email).toBe('test@example.com');

    const user = await User.findOne({ email: 'test@example.com' });
    expect(user).not.toBeNull();
  });

  it('should reject duplicate signup', async () => {
    await request(app)
      .post('/api/auth/signup')
      .send({ email: 'test@example.com', password: 'password123' })
      .expect(409);
  });

  it('should signin existing user', async () => {
    const res = await request(app)
      .post('/api/auth/signin')
      .send({ email: 'test@example.com', password: 'password123' })
      .expect(200);

    expect(res.body.token).toBeTruthy();
  });

  it('should reject signin with wrong password', async () => {
    await request(app)
      .post('/api/auth/signin')
      .send({ email: 'test@example.com', password: 'wrongpass' })
      .expect(401);
  });
});
