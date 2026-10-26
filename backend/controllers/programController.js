const Program = require('../models/Program');
const Institute = require('../models/Institute');
const Participation = require('../models/Participation');
const { asyncHandler, requireFields, HttpError, escapeRegex } = require('../utils/helpers');

const POPULATE_INSTITUTE = { path: 'institute', select: 'name location verificationStatus' };

const listPrograms = asyncHandler(async (req, res) => {
  const { q, category, location, date, status, institute, mine } = req.query;
  const filter = {};

  if (mine === '1' && req.user) {
    const inst = await Institute.findOne({ owner: req.user._id });
    filter.institute = inst ? inst._id : null;
  } else if (institute) filter.institute = institute;
  if (status) filter.status = status;
  if (category) filter.category = category;
  if (location) filter.location = { $regex: escapeRegex(location), $options: 'i' };
  if (date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    filter.date = { $gte: start, $lte: end };
  }
  if (q) {
    const rx = { $regex: escapeRegex(q), $options: 'i' };
    filter.$or = [{ title: rx }, { description: rx }];
  }

  const programs = await Program.find(filter).populate(POPULATE_INSTITUTE).sort({ date: 1 });
  res.json({ count: programs.length, programs });
});

const getProgram = asyncHandler(async (req, res) => {
  const program = await Program.findById(req.params.id).populate(POPULATE_INSTITUTE);
  if (!program) throw new HttpError(404, 'Program not found.');
  const enrolledCount = await Participation.countDocuments({ program: program._id });
  res.json({ program, enrolledCount });
});

const createProgram = asyncHandler(async (req, res) => {
  requireFields(req.body, ['title', 'description', 'category', 'location', 'date', 'serviceHours', 'requiredStudents']);
  const institute = await Institute.findOne({ owner: req.user._id });
  if (!institute) throw new HttpError(404, 'No institute profile found for this account.');
  const program = await Program.create({ ...req.body, institute: institute._id });
  await program.populate(POPULATE_INSTITUTE);
  res.status(201).json({ program });
});

const updateProgram = asyncHandler(async (req, res) => {
  const program = await Program.findById(req.params.id);
  if (!program) throw new HttpError(404, 'Program not found.');
  const institute = await Institute.findById(program.institute);
  if (req.user.role !== 'admin' && String(institute.owner) !== String(req.user._id)) {
    throw new HttpError(403, 'You can only manage programs run by your institute.');
  }
  const editable = ['title', 'description', 'category', 'location', 'date', 'startTime', 'endTime', 'serviceHours', 'requiredStudents', 'status'];
  editable.forEach((f) => {
    if (req.body[f] !== undefined) program[f] = req.body[f];
  });
  await program.save();
  res.json({ program });
});

const deleteProgram = asyncHandler(async (req, res) => {
  const program = await Program.findById(req.params.id);
  if (!program) throw new HttpError(404, 'Program not found.');
  const institute = await Institute.findById(program.institute);
  if (req.user.role !== 'admin' && String(institute.owner) !== String(req.user._id)) {
    throw new HttpError(403, 'You can only manage programs run by your institute.');
  }
  await program.deleteOne();
  res.json({ message: 'Program removed.' });
});

const joinProgram = asyncHandler(async (req, res) => {
  const program = await Program.findById(req.params.id);
  if (!program) throw new HttpError(404, 'Program not found.');
  if (program.status !== 'Open') throw new HttpError(400, 'This program is not accepting participants.');

  const existing = await Participation.findOne({ participant: req.user._id, program: program._id });
  if (existing) throw new HttpError(400, 'You have already joined this program.');

  const enrolledCount = await Participation.countDocuments({ program: program._id });
  if (enrolledCount >= program.requiredStudents) {
    throw new HttpError(400, 'This program has reached its participant limit.');
  }

  const participation = await Participation.create({
    participant: req.user._id,
    institute: program.institute,
    program: program._id,
    serviceHours: program.serviceHours,
    completionStatus: 'Enrolled',
    verificationStatus: 'Pending',
  });
  await participation.populate('program', 'title date serviceHours');
  res.status(201).json({ participation });
});

const listParticipants = asyncHandler(async (req, res) => {
  const program = await Program.findById(req.params.id);
  if (!program) throw new HttpError(404, 'Program not found.');
  const institute = await Institute.findById(program.institute);
  if (req.user.role !== 'admin' && String(institute.owner) !== String(req.user._id)) {
    throw new HttpError(403, 'Only the institute running this program can view participants.');
  }
  const participations = await Participation.find({ program: program._id })
    .populate('participant', 'name email phone profileImage')
    .sort({ createdAt: -1 });
  res.json({ count: participations.length, participations });
});

module.exports = { listPrograms, getProgram, createProgram, updateProgram, deleteProgram, joinProgram, listParticipants };
