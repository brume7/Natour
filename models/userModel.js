const { Schema, model } = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const AppError = require('../utils/appError');

const userSchema = new Schema({
  name: {
    type: String,
    required: [true, 'user must have a name'],
    minlength: 5,
    maxlength: 30,
    trim: true
  },
  email: {
    type: String,
    required: [true, 'user must have an email'],
    minlength: 5,
    maxlength: 30,
    trim: true,
    unique: true,
    validate: [validator.isEmail, 'input must be an email'],
    lowercase: true
  },
  photo: String,
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user'
  },
  password: {
    type: String,
    required: [true, 'Password can not be empty'],
    minlength: 8,
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      // This only works on CREATE and SAVE!!!
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords are not the same!'
    }
  },
  passwordChangedAt: {
    type: Date
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false
  }
});

userSchema.pre('save', async function (next) {
  if (this.isNew || this.isModified('password')) {
    try {
      const SALT_ROUND = 10;
      const salt = await bcrypt.genSalt(SALT_ROUND);
      this.password = await bcrypt.hash(this.password, salt);
      this.passwordChangedAt = Date.now() - 1000;
      this.passwordConfirm = undefined;
      return next();
    } catch (err) {
      return next(new AppError('Error saving password', 500));
    }
  }
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.isCorrectPassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimeStamp;
  }
  return false;
};

userSchema.methods.resetTokenGen = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = model('User', userSchema);

module.exports = User;
