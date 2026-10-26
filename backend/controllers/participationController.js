const Participation = require('../models/Participation');
const Program = require('../models/Program');
const Institute = require('../models/Institute');
const { asyncHandler, HttpError } = require('../utils/helpers');

const POPULATE = [
  { path: 'program', select: 'title date serviceHours location institute' },
  { path: 'institute', select: 'name location' },
  { path: 'organization', select: 'name location' },
  { path: 'opportunity', select: 'title date serviceHours location' },
];

const myParticipations = asyncHandler(async (req, res) => {
  const participations = await Participation.find({ participant: req.user._id })
    .populate(POPULATE)
    .sort({ createdAt: -1 });
  res.json({ count: participations.length, participations });
});

const updateParticipation = asyncHandler(async (req, res) => {
  const participation = await Participation.findById(req.params.id);
  if (!participation) throw new HttpError(404, 'Participation record not found.');

  if (participation.institute) {
    const institute = await Institute.findById(participation.institute);
    if (req.user.role !== 'admin' && String(institute.owner) !== String(req.user._id)) {
      throw new HttpError(403, 'Only the institute managing this record can update it.');
    }
  } else if (participation.organization) {
    const Organization = require('../models/Organization');
    const org = await Organization.findById(participation.organization);
    if (req.user.role !== 'admin' && String(org.owner) !== String(req.user._id)) {
      throw new HttpError(403, 'Only the organization managing this record can update it.');
    }
  }

  const { completionStatus, verificationStatus } = req.body;
  if (completionStatus) {
    if (!['Enrolled', 'Completed'].includes(completionStatus)) {
      throw new HttpError(400, 'Invalid completion status.');
    }
    participation.completionStatus = completionStatus;
  }
  if (verificationStatus) {
    if (!['Pending', 'Verified', 'Rejected'].includes(verificationStatus)) {
      throw new HttpError(400, 'Invalid verification status.');
    }
    participation.verificationStatus = verificationStatus;
  }
  if (participation.completionStatus === 'Completed' && !participation.completionDate) {
    participation.completionDate = new Date();
  }
  await participation.save();
  await participation.populate(POPULATE);
  res.json({ participation });
});

const listByProgram = asyncHandler(async (req, res) => {
  const { program } = req.query;

  if (program) {
    const targetProgram = await Program.findById(program);
    if (!targetProgram) throw new HttpError(404, 'Program not found.');
    const institute = await Institute.findById(targetProgram.institute);
    if (req.user.role !== 'admin' && String(institute.owner) !== String(req.user._id)) {
      throw new HttpError(403, 'Only the institute running this program can view its participants.');
    }
    const participations = await Participation.find({ program }).populate(POPULATE).sort({ createdAt: -1 });
    return res.json({ count: participations.length, participations });
  }

  if (req.user.role === 'college') {
    const institute = await Institute.findOne({ owner: req.user._id });
    if (!institute) return res.json({ count: 0, participations: [] });
    const programs = await Program.find({ institute: institute._id }).select('_id');
    const participations = await Participation.find({
      program: { $in: programs.map((p) => p._id) },
    })
      .populate(POPULATE)
      .sort({ createdAt: -1 });
    return res.json({ count: participations.length, participations });
  }

  throw new HttpError(403, 'Specify a program or use an institute account.');
});

module.exports = { myParticipations, updateParticipation, listByProgram };
