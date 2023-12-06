const AppError = require('../utils/appError');
const { promisify } = require('util');
const catchAsync = require('../utils/catchAsync');
const User = require('./../models/userModel');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/email');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.TOKEN_PASSWORD, {
    expiresIn: process.env.TOKEN_EXPIRATION,
  });
};

const createSendToken = (user, statusCode, res, showUser) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(Date.now() + process.env.TOKEN_COOKIE_EXPIRATION * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };

  if (process.env.NODE_ENV == 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  return res.status(statusCode).json({
    status: 'Success',
    token,
    data: showUser
      ? {
          user,
        }
      : undefined,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const { name, email, password, passwordConfirm, passwordChangedAt } = req.body;
  const newUser = await User.create({
    name,
    email,
    password,
    passwordConfirm,
    passwordChangedAt,
  }); //remove password changed at
  newUser.password = undefined;

  createSendToken(newUser, 201, res, true);
});
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email | !password) {
    return next(new AppError(' email or password required', 404));
  }

  const user = await User.findOne({ email, active: { $eq: true } }).select('+password');
  if (!user) {
    return next(new AppError('Incorrect email or password', 401));
  }
  const isCorrectPassword = await user.isCorrectPassword(password);

  if (!isCorrectPassword) {
    return next(new AppError('Incorrect email or password', 401));
  }
  user.password = undefined;

  createSendToken(user, 200, res);
});

//protect tour routes
exports.protect = catchAsync(async (req, res, next) => {
  //get token
  const { headers } = req;
  let token;
  if (headers.authorization && headers.authorization.startsWith('Bearer')) {
    token = headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(new AppError('Please sign to gain access', 401));
  }
  //validatetoken
  const decoded = await promisify(jwt.verify)(token, process.env.TOKEN_PASSWORD);
  //user still exist
  const currentUser = await User.findOne({ _id: decoded.id, active: { $eq: true } });
  if (!currentUser) {
    return next(new AppError('the user does not longer exit', 401));
  }
  //user changed password after jwt
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(new AppError('the user password has been changed. Please log in again', 401));
  }

  req.user = currentUser;
  next(); //grant access
});

exports.isLoggedIn = catchAsync(async (req, res, next) => {
  if (req.cookies.jwt) {
    const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.TOKEN_PASSWORD);

    const currentUser = await User.findOne({ _id: decoded.id, active: { $eq: true } });
    if (!currentUser) {
      return next();
    }
    //user changed password after jwt
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return next();
    }

    req.locals.user = currentUser;
    next(); //grant access
  }
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('User does not have permision', 403));
    }
    next();
  };
};

//password issues
exports.forgotPassword = catchAsync(async (req, res, next) => {
  // get user by token
  const { body, protocol } = req;
  const user = await User.findOne({ email: body.email });

  if (!user) {
    return next(new AppError('your request was invalid', 400));
  }

  //generate a reset token that expires in a day
  const resetToken = user.resetTokenGen();
  await user.save({ validateBeforeSave: false });

  //send back as an email
  const resetUrl = `${protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
  const message = `<h1>Forgot your password?</h1> 
  <p>Use the link below to reset your password</p> 
  <h6 style="text-align: center;"><a href=${resetUrl}>reset link</a></h6> 
  <br /><b>If you did not request for a change password ignore this message.</b>`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Reset password token (valid for 10 min)',
      message,
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError('there was error sending your email', 500));
  }

  res.status(200).json({
    status: 'success',
    message: 'Token sent to email',
  });
});
exports.resetPassword = catchAsync(async (req, res, next) => {
  //get user based on token
  const hashToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({ passwordResetToken: hashToken, passwordResetExpires: { $gt: Date.now() } });

  if (!user) {
    return next(new AppError('your reset token expired', 400));
  }

  //update changed password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // web token
  createSendToken(user, 200, res);
});
exports.updatePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, password, passwordConfirm } = req.body;

  //get user from collection
  let user = await User.findOne({ _id: req.user._id }).select('+password');

  //check current password is correct
  const isCorrectPassword = await user.isCorrectPassword(currentPassword);

  if (!isCorrectPassword) {
    return next(new AppError('current password incorrect', 401));
  }

  user.password = password;
  user.passwordConfirm = passwordConfirm;
  await user.save();

  createSendToken(user, 200, res);
});
