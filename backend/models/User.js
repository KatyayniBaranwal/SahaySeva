const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const ROLES = ['user', 'provider', 'volunteer', 'ngo', 'college', 'admin'];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: [true, 'Password is required'], minlength: 6, select: false },
    phone: { type: String, trim: true, default: '' },
    role: { type: String, enum: ROLES, default: 'user' },
    location: { type: String, trim: true, default: '' },
    profileImage: { type: String, default: '' },
    affiliatedInstitute: { type: mongoose.Schema.Types.ObjectId, ref: 'Institute', default: null },
    savedServices: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }],
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

userSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
module.exports.ROLES = ROLES;
