const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const filterObj = require('../utils/filterObj');
const User = require('./../models/userModel');

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(User.find(), req.query).filter().sort().limitFields().pagination();
  const users = await features.query;

  res.status(200).json({
    status: 'success',
    results: users.length,
    data: { users },
    requestedAt: req.requestTime
  });
});
exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'route is not defined'
  });
};
exports.getUser = catchAsync(async ({ params }, res, next) => {
  const { id } = params;
  const user = await User.findOne({ _id: id });

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: user
  });
});
exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'route is not defined'
  });
};
exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'route is not defined'
  });
};

//user personal controllers
exports.updateMe = catchAsync(async (req, res, next) => {
  const filteredBody = filterObj(req.body, 'photo', 'username', 'email');

  const user = await User.findByIdAndUpdate(req.user._id, filteredBody, {
    new: true,
    runValidators: true
  });

  return res.status(200).json({
    status: 'success',
    message: 'Profile updated'
  });
});
exports.deleteMe = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.user._id, { active: false });
  res.status(204).json({
    status: 'success'
  });
});
