const Institute = require('../models/Institute');
const Program = require('../models/Program');
const User = require('../models/User');
const { asyncHandler, requireFields, isEmail, HttpError, escapeRegex } = require('../utils/helpers');

const listInstitutes = asyncHandler(async (req, res) => {
  const { q, location } = req.query;
  const filter = {};
  if (location) filter.location = { $regex: escapeRegex(location), $options: 'i' };
  if (q) {
    const rx = { $regex: escapeRegex(q), $options: 'i' };
    filter.$or = [{ name: rx }, { description: rx }];
  }
  const institutes = await Institute.find(filter).sort({ createdAt: -1 });

  const withCounts = await Promise.all(
    institutes.map(async (inst) => {
      const [studentCount, openPrograms] = await Promise.all([
        User.countDocuments({ affiliatedInstitute: inst._id }),
        Program.countDocuments({ institute: inst._id, status: 'Open' }),
      ]);
      return { ...inst.toJSON(), studentCount, openPrograms };
    })
  );

  res.json({ count: withCounts.length, institutes: withCounts });
});

const getInstitute = asyncHandler(async (req, res) => {
  const institute = await Institute.findById(req.params.id);
  if (!institute) throw new HttpError(404, 'Institute not found.');
  const programs = await Program.find({ institute: institute._id }).sort({ date: 1 });
  res.json({ institute, programs });
});

const getMyInstitute = asyncHandler(async (req, res) => {
  const institute = await Institute.findOne({ owner: req.user._id });
  if (!institute) throw new HttpError(404, 'No institute profile found for this account.');
  res.json({ institute });
});

const updateInstitute = asyncHandler(async (req, res) => {
  const institute = await Institute.findById(req.params.id);
  if (!institute) throw new HttpError(404, 'Institute not found.');
  if (String(institute.owner) !== String(req.user._id) && req.user.role !== 'admin') {
    throw new HttpError(403, 'You can only manage your own institute profile.');
  }
  const editable = ['name', 'description', 'location', 'contact'];
  editable.forEach((f) => {
    if (req.body[f] !== undefined) institute[f] = req.body[f];
  });
  await institute.save();
  res.json({ institute });
});

const verifyInstitute = asyncHandler(async (req, res) => {
  const { verificationStatus } = req.body;
  if (!['Pending Verification', 'Verified', 'Rejected'].includes(verificationStatus)) {
    throw new HttpError(400, 'Invalid verification status.');
  }
  const institute = await Institute.findById(req.params.id);
  if (!institute) throw new HttpError(404, 'Institute not found.');
  institute.verificationStatus = verificationStatus;
  await institute.save();
  res.json({ institute });
});

const addStudent = asyncHandler(async (req, res) => {
  requireFields(req.body, ['name', 'email']);
  if (!isEmail(req.body.email)) throw new HttpError(400, 'Please provide a valid student email.');

  const institute = await Institute.findById(req.params.id);
  if (!institute) throw new HttpError(404, 'Institute not found.');
  if (String(institute.owner) !== String(req.user._id) && req.user.role !== 'admin') {
    throw new HttpError(403, 'Only the institute owner can add students.');
  }

  const email = String(req.body.email).toLowerCase();
  const existing = await User.findOne({ email });
  if (existing) {
    if (String(existing.affiliatedInstitute) === String(institute._id)) {
      throw new HttpError(400, 'This student is already affiliated with your institute.');
    }
    throw new HttpError(400, 'A user with this email already exists on SahaySeva.');
  }

  const student = await User.create({
    name: req.body.name,
    email,
    phone: req.body.phone || '',
    password: 'Student@123',
    role: 'volunteer',
    location: institute.location,
    affiliatedInstitute: institute._id,
  });

  res.status(201).json({
    student,
    message: 'Student account created. Default password: Student@123',
  });
});

const listStudents = asyncHandler(async (req, res) => {
  const institute = await Institute.findById(req.params.id);
  if (!institute) throw new HttpError(404, 'Institute not found.');
  const students = await User.find({ affiliatedInstitute: institute._id }).sort({ name: 1 });
  res.json({ count: students.length, students });
});

module.exports = {
  listInstitutes,
  getInstitute,
  getMyInstitute,
  updateInstitute,
  verifyInstitute,
  addStudent,
  listStudents,
};
