const Review = require('../models/reviewModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const filterObj = require('../utils/filterObj');
const { deleteOne, updateOne, getAll } = require('./factoryController');

exports.createReview = catchAsync(async (req, res, next) => {
  const filteredBody = filterObj(req.body, 'review', 'rating', 'tour');
  filteredBody.user = !filteredBody.user ? req.user._id : filteredBody.user;
  filteredBody.tour = !filteredBody.tour ? req.params.tourId : filteredBody.tour;
  const review = await Review.create(filteredBody);
  res.status(201).json({
    status: 'success',
    data: { review }
  });
});

exports.getReview = catchAsync(async ({ params }, res, next) => {
  const { id } = params;
  const review = await Review.findOne({ _id: id });

  if (!review) {
    return next(new AppError('Review not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: review
  });
});

exports.getAllReviews = getAll(Review);
exports.updateReview = updateOne(Review);
exports.deleteReview = deleteOne(Review);
