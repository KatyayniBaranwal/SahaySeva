const Certificate = require('../models/Certificate');
const Counter = require('../models/Counter');
const VolunteerApplication = require('../models/VolunteerApplication');
const Participation = require('../models/Participation');
const { asyncHandler, HttpError } = require('../utils/helpers');

const buildCertificateId = async () => {
  const year = new Date().getFullYear();
  const seq = await Counter.nextSeq(`certificate-${year}`);
  return `SS-${year}-${String(seq).padStart(4, '0')}`;
};

const verifyCertificate = asyncHandler(async (req, res) => {
  const certificateId = String(req.params.certificateId || '').trim().toUpperCase();
  const certificate = await Certificate.findOne({
    certificateId: { $regex: `^${certificateId}$`, $options: 'i' },
  });
  if (!certificate) {
    return res.status(404).json({ valid: false, message: `No certificate found with ID "${certificateId}".` });
  }
  res.json({
    valid: certificate.verificationStatus === 'Valid',
    certificate,
  });
});

const myCertificates = asyncHandler(async (req, res) => {
  const certificates = await Certificate.find({ recipient: req.user._id }).sort({ createdAt: -1 });
  res.json({ count: certificates.length, certificates });
});

const listCertificates = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.user.role === 'ngo') {
    const Organization = require('../models/Organization');
    const org = await Organization.findOne({ owner: req.user._id });
    filter.issuedByOrganization = org ? org._id : null;
  } else if (req.user.role === 'college') {
    const Institute = require('../models/Institute');
    const inst = await Institute.findOne({ owner: req.user._id });
    filter.issuedByInstitute = inst ? inst._id : null;
  }
  const certificates = await Certificate.find(filter).sort({ createdAt: -1 });
  res.json({ count: certificates.length, certificates });
});

const generateFromApplication = asyncHandler(async (req, res) => {
  const { applicationId } = req.body;
  if (!applicationId) throw new HttpError(400, 'applicationId is required.');

  const application = await VolunteerApplication.findById(applicationId).populate('opportunity');
  if (!application) throw new HttpError(404, 'Application not found.');

  const Organization = require('../models/Organization');
  const org = await Organization.findById(application.opportunity.organization);
  if (String(org.owner) !== String(req.user._id)) {
    throw new HttpError(403, 'Only the organization that ran this activity can issue its certificate.');
  }
  if (application.status !== 'Completed') {
    throw new HttpError(400, 'Certificates can only be issued for completed activities.');
  }
  if (application.opportunity.certificateEligible === false) {
    throw new HttpError(400, 'This activity is not marked as certificate eligible.');
  }

  const duplicate = await Certificate.findOne({ sourceId: application._id });
  if (duplicate) throw new HttpError(400, `Certificate ${duplicate.certificateId} already exists for this activity.`);

  const volunteer = await require('../models/User').findById(application.volunteer);
  const certificate = await Certificate.create({
    certificateId: await buildCertificateId(),
    recipientName: volunteer.name,
    recipient: volunteer._id,
    organizationName: org.name,
    activityName: application.opportunity.title,
    serviceHours: application.opportunity.serviceHours,
    completionDate: new Date(),
    issuer: org.name,
    issuerType: 'Organization',
    issuedByOrganization: org._id,
    sourceModel: 'VolunteerApplication',
    sourceId: application._id,
    verificationData: {
      verifiedUrl: `${process.env.CLIENT_URL || ''}/verify-certificate`,
      certificateId: '',
      issuedAt: new Date(),
    },
  });
  certificate.verificationData.certificateId = certificate.certificateId;
  await certificate.save();

  res.status(201).json({ certificate });
});

const generateFromParticipation = asyncHandler(async (req, res) => {
  const { participationId } = req.body;
  if (!participationId) throw new HttpError(400, 'participationId is required.');

  const participation = await Participation.findById(participationId).populate('program');
  if (!participation) throw new HttpError(404, 'Participation record not found.');

  const Institute = require('../models/Institute');
  const institute = await Institute.findById(participation.institute);
  if (String(institute.owner) !== String(req.user._id)) {
    throw new HttpError(403, 'Only the institute that ran this program can issue its certificate.');
  }
  if (participation.completionStatus !== 'Completed' || participation.verificationStatus !== 'Verified') {
    throw new HttpError(400, 'Certificates can only be issued for completed and verified participation.');
  }

  const duplicate = await Certificate.findOne({ sourceId: participation._id });
  if (duplicate) throw new HttpError(400, `Certificate ${duplicate.certificateId} already exists for this participation.`);

  const User = require('../models/User');
  const participant = await User.findById(participation.participant);
  const certificate = await Certificate.create({
    certificateId: await buildCertificateId(),
    recipientName: participant.name,
    recipient: participant._id,
    organizationName: institute.name,
    activityName: participation.program.title,
    serviceHours: participation.serviceHours,
    completionDate: participation.completionDate || new Date(),
    issuer: institute.name,
    issuerType: 'Institute',
    issuedByInstitute: institute._id,
    sourceModel: 'Participation',
    sourceId: participation._id,
    verificationData: {
      verifiedUrl: `${process.env.CLIENT_URL || ''}/verify-certificate`,
      certificateId: '',
      issuedAt: new Date(),
    },
  });
  certificate.verificationData.certificateId = certificate.certificateId;
  await certificate.save();

  res.status(201).json({ certificate });
});

const revokeCertificate = asyncHandler(async (req, res) => {
  const certificate = await Certificate.findById(req.params.id);
  if (!certificate) throw new HttpError(404, 'Certificate not found.');
  certificate.verificationStatus = certificate.verificationStatus === 'Valid' ? 'Revoked' : 'Valid';
  await certificate.save();
  res.json({ certificate });
});

module.exports = {
  verifyCertificate,
  myCertificates,
  listCertificates,
  generateFromApplication,
  generateFromParticipation,
  revokeCertificate,
};
