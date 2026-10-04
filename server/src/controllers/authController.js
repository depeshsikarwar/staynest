import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import generateToken from '../utils/generateToken.js';

const userResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  avatar: user.avatar,
  wishlist: user.wishlist || [],
  token: generateToken(user._id),
});

// POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Name, email and password are required');
  }

  const exists = await User.findOne({ email });
  if (exists) {
    res.status(409);
    throw new Error('Email already registered');
  }

  const user = await User.create({
    name,
    email,
    password,
    role: role === 'host' ? 'host' : 'guest',
  });
  res.status(201).json(userResponse(user));
});

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }
  res.json(userResponse(user));
});

// GET /api/auth/me
export const getMe = asyncHandler(async (req, res) => {
  res.json(req.user);
});

// GET /api/auth/wishlist
export const getWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: 'wishlist',
    match: { isActive: true },
    populate: { path: 'host', select: 'name' },
  });
  res.json(user?.wishlist || []);
});

// POST /api/auth/wishlist/:listingId or POST /api/auth/wishlist (toggle)
export const toggleWishlist = asyncHandler(async (req, res) => {
  const listingId = req.params.listingId || req.body.listingId;
  if (!listingId) {
    res.status(400);
    throw new Error('Listing ID is required');
  }

  const user = await User.findById(req.user._id);
  const index = user.wishlist.findIndex((id) => id.toString() === listingId.toString());
  let isWishlisted = false;

  if (index > -1) {
    user.wishlist.splice(index, 1);
    isWishlisted = false;
  } else {
    user.wishlist.push(listingId);
    isWishlisted = true;
  }

  await user.save();
  res.json({ wishlist: user.wishlist, isWishlisted });
});

