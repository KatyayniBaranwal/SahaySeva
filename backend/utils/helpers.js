class HttpError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

const requireFields = (body = {}, fields = []) => {
  const missing = fields.filter(
    (f) => body[f] === undefined || body[f] === null || String(body[f]).trim() === ''
  );
  if (missing.length) {
    throw new HttpError(400, `Missing required field(s): ${missing.join(', ')}`);
  }
};

const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());

const escapeRegex = (text = '') => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const CATEGORIES = [
  'Elderly Assistance',
  'Education',
  'Healthcare Assistance',
  'Food Assistance',
  'Transportation',
  'Household Help',
  'Digital Assistance',
  'Emergency Support',
  'Community Events',
  'Environment',
  'Other',
];

const URGENCIES = ['Low', 'Medium', 'High', 'Emergency'];

module.exports = { HttpError, asyncHandler, requireFields, isEmail, escapeRegex, CATEGORIES, URGENCIES };
