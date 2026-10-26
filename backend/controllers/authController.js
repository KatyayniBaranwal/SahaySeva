const User = require('../models/User');
const ServiceProvider = require('../models/ServiceProvider');
const Organization = require('../models/Organization');
const Institute = require('../models/Institute');
const generateToken = require('../utils/token');
const { asyncHandler, requireFields, isEmail, HttpError } = require('../utils/helpers');

const SELECTABLE_ROLES = ['user', 'provider', 'volunteer', 'ngo', 'college'];

const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, location, role, organizationName, instituteName } =
    req.body;

  requireFields(req.body, ['name', 'email', 'password']);
  if (!isEmail(email)) throw new HttpError(400, 'Please provide a valid email address.');
  if (String(password).length < 6) throw new HttpError(400, 'Password must be at least 6 characters.');

  const chosenRole = SELECTABLE_ROLES.includes(role) ? role : 'user';
  if (chosenRole === 'ngo' && !organizationName) {
    throw new HttpError(400, 'Organization name is required for NGO registration.');
  }
  if (chosenRole === 'college' && !instituteName) {
    throw new HttpError(400, 'Institute name is required for college registration.');
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) throw new HttpError(400, 'An account with this email already exists.');

  const user = await User.create({
    name,
    email,
    password,
    phone,
    location,
    role: chosenRole,
  });

  if (chosenRole === 'provider') {
    await ServiceProvider.create({
      user: user._id,
      location: location || '',
      description: '',
    });
  }
  if (chosenRole === 'ngo') {
    await Organization.create({
      name: organizationName,
      description: '',
      location: location || '',
      contact: { email },
      organizationType: 'SahaySeva Organization',
      owner: user._id,
    });
  }
  if (chosenRole === 'college') {
    await Institute.create({
      name: instituteName,
      location: location || '',
      contact: { email },
      owner: user._id,
    });
  }

  res.status(201).json({ token: generateToken(user), user });
});

const login = asyncHandler(async (req, res) => {
  requireFields(req.body, ['email', 'password']);
  const user = await User.findOne({ email: String(req.body.email).toLowerCase() }).select(
    '+password'
  );
  if (!user || !(await user.matchPassword(req.body.password))) {
    throw new HttpError(401, 'Invalid email or password.');
  }
  res.json({ token: generateToken(user), user });
});

const getMe = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});

module.exports = { register, login, getMe };
