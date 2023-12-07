const Review = require('../models/reviewModel');
const mongoose = require('mongoose');
const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const filterObj = require('../utils/filterObj');
const { updateOne, getAll } = require('./factoryController');
const { getTourView } = require('./viewController');

exports.createReview = catchAsync(async (req, res, next) => {
  const filteredBody = filterObj(req.body, 'review', 'rating', 'tour');
  filteredBody.user = !filteredBody.user ? req.user._id : filteredBody.user;
  filteredBody.tour = !filteredBody.tour ? req.params.tourId : filteredBody.tour;
  const review = await Review.create(filteredBody);
  res.status(201).json({
    status: 'success',
    data: { review },
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
    data: review,
  });
});

exports.getAllReviews = getAll(Review);
exports.updateReview = updateOne(Review);
exports.deleteReview = catchAsync(async ({ params, user, query }, res, next) => {
  const { id } = params;
  const review = await Review.findOne({ _id: id });
  if (!review) {
    return next(new AppError('Review not found', 404));
  }

  if (review.user.id !== user.id && user.role != 'admin') {
    return next(new AppError('User does not have permision', 403));
  }

  await Review.findOneAndDelete({ _id: id });

  res.status(203).json({
    status: 'deleted',
  });
});

exports.updateReviewCount = catchAsync(async ({ params }, res, next) => {
  const { tour } = params;
  const stats = await Review.aggregate([
    {
      $match: { tour: mongoose.Types.ObjectId(tour) }, // Convert tour to ObjectId if needed
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: {
          $avg: '$rating',
        },
      },
    },
  ]);

  if (stats.length === 0) {
    throw new AppError('No reviews found for the specified tour', 404);
  }

  const updatedTour = await Tour.findOneAndUpdate(
    { _id: tour },
    {
      ratingsAverage: stats[0].avgRating,
      ratingsQuantity: stats[0].nRating,
    },
    { new: true }, // to return the updated document
  );

  if (!updatedTour) {
    throw new AppError('Tour does not exist', 404);
  }

  res.status(200).json({});
});
