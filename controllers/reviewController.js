const Review = require('../models/reviewModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const filterObj = require('../utils/filterObj');

exports.createReview = catchAsync(async (req, res, next) => {
  const filteredBody = filterObj(req.body, 'review', 'rating', 'tour', 'user');
  filteredBody.user = !filteredBody.user ? req.user._id : filteredBody.user;
  filteredBody.tour = !filteredBody.tour ? req.params.tourId : filteredBody.tour;
  const review = await Review.create(filteredBody);
  res.status(201).json({
    status: 'success',
    data: { review }
  });
});

exports.getAllReviews = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Review.find(), req.query).filter().sort().limitFields().pagination();
  const reviews = await features.query;
  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: { reviews },
    requestedAt: req.requestTime
  });
});
