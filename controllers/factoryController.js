const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new AppError('No doc found with that ID', 404));
    }
    res.status(204).json({
      status: 'success',
      data: null
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!doc) {
      return next(new AppError('No doc found with that ID', 404));
    }
    res.status(200).json({
      status: 'success',
      message: 'resource updated successfully',
      data: {
        data: doc
      }
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const newDoc = await Model.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        data: newDoc
      }
    });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    const filter = req.params.tourId ? { tour: req.params.tourId } : {}; // small hack for reviews
    const features = new APIFeatures(Model.find(filter), req.query).filter().sort().limitFields().pagination();
    const docs = await features.query;
    res.status(200).json({
      status: 'success',
      results: docs.length,
      data: { docs },
      requestedAt: req.requestTime
    });
  });
