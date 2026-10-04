import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Listing from '../models/Listing.js';
import Booking from '../models/Booking.js';
import Review from '../models/Review.js';

const listings = [
  {
    title: 'Haveli Courtyard Homestay',
    description: 'Stay in a 150-year-old restored haveli in the Pink City, with rooftop breakfast and views of Nahargarh Fort.',
    type: 'homestay',
    city: 'Jaipur',
    state: 'Rajasthan',
    address: 'Near Hawa Mahal, Old City',
    pricePerNight: 2800,
    maxGuests: 4,
    bedrooms: 2,
    amenities: ['WiFi', 'Breakfast', 'AC', 'Rooftop'],
    images: [
      'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80',
    ],
  },
  {
    title: 'Lakeview Boutique Hotel',
    description: 'Elegant rooms overlooking Lake Pichola, a short walk from City Palace.',
    type: 'hotel',
    city: 'Udaipur',
    state: 'Rajasthan',
    address: 'Lal Ghat, Udaipur',
    pricePerNight: 4500,
    maxGuests: 2,
    bedrooms: 1,
    amenities: ['WiFi', 'AC', 'Lake view', 'Restaurant'],
    images: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
    ],
  },
  {
    title: 'Desert Camp Cottage',
    description: 'Mud-walled cottage near the Sam sand dunes with a campfire and folk music evenings.',
    type: 'cottage',
    city: 'Jaisalmer',
    state: 'Rajasthan',
    address: 'Sam Sand Dunes Road',
    pricePerNight: 3200,
    maxGuests: 3,
    bedrooms: 1,
    amenities: ['Campfire', 'Meals included', 'Camel safari'],
    images: [
      'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
    ],
  },
  {
    title: 'Backpackers Hub Hostel',
    description: 'Social hostel with dorm beds, a co-working corner and weekly city walks.',
    type: 'hostel',
    city: 'Jaipur',
    state: 'Rajasthan',
    address: 'C-Scheme, Jaipur',
    pricePerNight: 650,
    maxGuests: 1,
    bedrooms: 0,
    amenities: ['WiFi', 'Lockers', 'Common kitchen'],
    images: [
      'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80',
    ],
  },
  {
    title: 'Cliffside Villa with Pool',
    description: 'Private 3-BHK villa with an infinity pool facing the Arabian Sea.',
    type: 'villa',
    city: 'Goa',
    state: 'Goa',
    address: 'Vagator, North Goa',
    pricePerNight: 12000,
    maxGuests: 8,
    bedrooms: 3,
    amenities: ['Pool', 'WiFi', 'Kitchen', 'Parking', 'AC'],
    images: [
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?auto=format&fit=crop&w=1200&q=80',
    ],
  },
  {
    title: 'Himalayan Wooden Cottage',
    description: 'Cosy pinewood cottage in an apple orchard with mountain views from every window.',
    type: 'cottage',
    city: 'Manali',
    state: 'Himachal Pradesh',
    address: 'Old Manali',
    pricePerNight: 2200,
    maxGuests: 4,
    bedrooms: 2,
    amenities: ['Heater', 'WiFi', 'Mountain view', 'Bonfire'],
    images: [
      'https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1200&q=80',
    ],
  },
  {
    title: 'Houseboat on the Backwaters',
    description: 'Traditional kettuvallam houseboat with a private chef and sunset cruise.',
    type: 'homestay',
    city: 'Alleppey',
    state: 'Kerala',
    address: 'Punnamada Lake',
    pricePerNight: 7500,
    maxGuests: 4,
    bedrooms: 2,
    amenities: ['Meals included', 'AC', 'Cruise'],
    images: [
      'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    ],
  },
  {
    title: 'Riverside Ashram Stay',
    description: 'Simple, peaceful rooms by the Ganga with morning yoga sessions.',
    type: 'hostel',
    city: 'Rishikesh',
    state: 'Uttarakhand',
    address: 'Tapovan, Rishikesh',
    pricePerNight: 900,
    maxGuests: 2,
    bedrooms: 1,
    amenities: ['Yoga', 'River view', 'Vegetarian meals'],
    images: [
      'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1519451241324-20b4ea2c4220?auto=format&fit=crop&w=1200&q=80',
    ],
  },
];

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Promise.all([User.deleteMany(), Listing.deleteMany(), Booking.deleteMany(), Review.deleteMany()]);

  const host = await User.create({ name: 'Ravi Host', email: 'host@staynest.dev', password: 'host123', role: 'host' });
  await User.create({ name: 'Ananya Guest', email: 'guest@staynest.dev', password: 'guest123' });

  await Listing.insertMany(listings.map((l) => ({ ...l, host: host._id })));

  console.log('Seed complete: 2 users, %d listings', listings.length);
  await mongoose.disconnect();
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
