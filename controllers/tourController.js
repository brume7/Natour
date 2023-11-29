const AppError = require('../utils/appError');
const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');
const { deleteOne, updateOne, createOne, getAll } = require('./factoryController');

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id).populate([
    {
      path: 'reviews',
      select: 'review rating user -tour'
    }
  ]);

  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      tour
    }
  });
});
exports.createTour = createOne(Tour);
exports.getAllTours = getAll(Tour);
exports.updateTour = updateOne(Tour);
exports.deleteTour = deleteOne(Tour);

exports.topFiveCheap = (req, res, next) => {
  req.query.sort = 'price,-ratingsAverage';
  req.query.limit = 5;
  req.query.fields = 'name,price,duration,ratingsAverage,difficulty';
  next();
};

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } }
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        num: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' }
      }
    },
    {
      $sort: { avgPrice: 1 }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: { stats }
  });
});
exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates'
    },
    {
      $match: { startDates: { $gte: new Date(`${year}-01-01`) } }
    },
    {
      $match: { startDates: { $lte: new Date(`${year}-12-31`) } }
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' }
      }
    },
    {
      $addFields: {
        month: '$_id'
      }
    },
    {
      $project: {
        _id: 0
      }
    },
    {
      $sort: { numTourStarts: -1 }
    },
    {
      $limit: 12
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: { plan }
  });
});

// /tours-within/:distance/center/:latlng/unit/:unit
// /tours-within/233/center/9.110072,7.427556/unit/mi
exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  let [latitude, longitude] = latlng.split(',');

  if (!latitude || !longitude) {
    next(new AppError('Longitude and latitude required', 400));
  }

  const radius = unit == 'mi' ? distance / 3959 : distance / 6371;

  const tours = await Tour.find({
    startLocation: {
      $geoWithin: { $centerSphere: [[longitude, latitude], radius] }
    }
  });

  res.status(200).json({
    results: tours.length || 0,
    status: 'success',
    data: tours
  });
});

exports.getToursDistances = catchAsync(async ({ params }, res, next) => {
  const { latlng, unit } = params;
  let [latitude, longitude] = latlng.split(',');

  if (!latitude || !longitude) {
    next(new AppError('Longitude and latitude required', 400));
  }
  const tours = await Tour.aggregate({});
});
