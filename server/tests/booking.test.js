import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app.js';
import User from '../src/models/User.js';
import Listing from '../src/models/Listing.js';
import Booking from '../src/models/Booking.js';
import generateToken from '../src/utils/generateToken.js';

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-key-12345';
process.env.NODE_ENV = 'test';

describe('POST /api/bookings', () => {
  let mongoServer;
  let hostUser;
  let guestUser;
  let hostToken;
  let guestToken;
  let listing;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  }, 60000);

  afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  beforeEach(async () => {
    await Booking.deleteMany({});
    await Listing.deleteMany({});
    await User.deleteMany({});

    hostUser = await User.create({
      name: 'Host User',
      email: 'host@example.com',
      password: 'password123',
      role: 'host',
    });

    guestUser = await User.create({
      name: 'Guest User',
      email: 'guest@example.com',
      password: 'password123',
      role: 'guest',
    });

    hostToken = generateToken(hostUser._id);
    guestToken = generateToken(guestUser._id);

    listing = await Listing.create({
      title: 'Cozy Mountain Cabin',
      description: 'A beautiful cabin in the woods',
      type: 'cottage',
      city: 'Manali',
      state: 'Himachal Pradesh',
      address: '123 Pine Forest Rd',
      pricePerNight: 1500,
      maxGuests: 4,
      bedrooms: 2,
      host: hostUser._id,
      isActive: true,
    });
  });

  it('valid booking → 201 with correct nights and price', async () => {
    const bookingData = {
      listingId: listing._id.toString(),
      checkIn: '2026-11-01',
      checkOut: '2026-11-05',
      guests: 2,
    };

    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${guestToken}`)
      .send(bookingData);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.nights).toBe(4);
    expect(res.body.totalPrice).toBe(4 * 1500); // 6000
    expect(res.body.guests).toBe(2);
    expect(res.body.listing).toBe(listing._id.toString());
    expect(res.body.guest).toBe(guestUser._id.toString());
    expect(res.body.status).toBe('pending');

    const savedBooking = await Booking.findById(res.body._id);
    expect(savedBooking).not.toBeNull();
    expect(savedBooking.nights).toBe(4);
    expect(savedBooking.totalPrice).toBe(6000);
  });

  it('check-out before check-in → 400', async () => {
    const bookingData = {
      listingId: listing._id.toString(),
      checkIn: '2026-11-05',
      checkOut: '2026-11-01',
      guests: 2,
    };

    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${guestToken}`)
      .send(bookingData);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toMatch(/Check-out must be at least one day after check-in/i);
  });

  it('same-day check-in and check-out → 400', async () => {
    const bookingData = {
      listingId: listing._id.toString(),
      checkIn: '2026-11-05',
      checkOut: '2026-11-05',
      guests: 2,
    };

    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${guestToken}`)
      .send(bookingData);

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/Check-out must be at least one day after check-in/i);
  });

  it('too many guests → 400', async () => {
    const bookingData = {
      listingId: listing._id.toString(),
      checkIn: '2026-11-01',
      checkOut: '2026-11-03',
      guests: 5, // listing.maxGuests is 4
    };

    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${guestToken}`)
      .send(bookingData);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toMatch(/maximum of 4 guests/i);
  });

  it('host booking own listing → 400', async () => {
    const bookingData = {
      listingId: listing._id.toString(),
      checkIn: '2026-11-01',
      checkOut: '2026-11-03',
      guests: 2,
    };

    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${hostToken}`)
      .send(bookingData);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toMatch(/cannot book your own listing/i);
  });

  it('unauthorized request (no token) → 401', async () => {
    const bookingData = {
      listingId: listing._id.toString(),
      checkIn: '2026-11-01',
      checkOut: '2026-11-03',
      guests: 2,
    };

    const res = await request(app)
      .post('/api/bookings')
      .send(bookingData);

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/not authorized/i);
  });

  it('non-existent listing → 404', async () => {
    const nonExistentId = new mongoose.Types.ObjectId().toString();
    const bookingData = {
      listingId: nonExistentId,
      checkIn: '2026-11-01',
      checkOut: '2026-11-03',
      guests: 2,
    };

    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${guestToken}`)
      .send(bookingData);

    expect(res.status).toBe(404);
    expect(res.body.message).toMatch(/listing not available/i);
  });
});
