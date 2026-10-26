const User = require('../models/User');
const { asyncHandler, requireFields, HttpError } = require('../utils/helpers');

const listUsers = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.role) filter.role = req.query.role;
  if (req.query.q) {
    const rx = { $regex: req.query.q, $options: 'i' };
    filter.$or = [{ name: rx }, { email: rx }, { location: rx }];
  }
  const users = await User.find(filter).sort({ createdAt: -1 });
  res.json({ count: users.length, users });
});

const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new HttpError(404, 'User not found.');
  res.json({ user });
});

const updateProfile = asyncHandler(async (req, res) => {
  requireFields(req.body, ['name']);
  const user = await User.findById(req.user._id);
  if (!user) throw new HttpError(404, 'User not found.');

  user.name = req.body.name;
  user.phone = req.body.phone ?? user.phone;
  user.location = req.body.location ?? user.location;
  user.profileImage = req.body.profileImage ?? user.profileImage;
  await user.save();

  res.json({ user });
});

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new HttpError(404, 'User not found.');
  if (user.role === 'admin') throw new HttpError(403, 'Admin accounts cannot be deleted.');
  await user.deleteOne();
  res.json({ message: 'User removed.' });
});

module.exports = { listUsers, getUser, updateProfile, deleteUser };
