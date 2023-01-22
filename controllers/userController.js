const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const filterObj = require('../utils/filterObj');
const User = require('./../models/userModel');
const { deleteOne, updateOne, createOne, getAll } = require('./factoryController');

exports.getAllUsers = getAll(User);
exports.createUser = createOne(User);
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
exports.updateUser = updateOne(User);
exports.deleteUser = deleteOne(User);

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
