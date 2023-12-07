const { Schema, model } = require('mongoose');
const Tour = require('./tourModel');
const AppError = require('../utils/appError');

const reviewSchema = new Schema(
  {
    review: {
      type: String,
      trim: true,
      minlength: [5, 'Review must be longer than 5 characters '],
      maxlength: [255, 'Review must be less than 255 characters'],
    },
    rating: {
      type: Number,
      min: [1, 'Rating must be bigger than 1'],
      max: [5, 'Rating must be less than 5'],
      required: 'Can not post review without a rating',
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    tour: {
      type: Schema.Types.ObjectId,
      ref: 'Tour',
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  },
);

reviewSchema.index(
  { tour: 1, user: 1 },
  {
    unique: true,
  },
);

reviewSchema.pre(/^find/, function (next) {
  this.populate([
    {
      path: 'user',
      select: ' name email photo',
    },
  ]);

  next();
});

reviewSchema.statics.calcAverageRatings = async function (tour) {
  try {
    const stats = await this.aggregate([
      {
        $match: { tour },
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
    const updatedTour = await Tour.findOneAndUpdate(
      { _id: tour },
      {
        ratingsAverage: stats[0].avgRating,
        ratingsQuantity: stats[0].nRating,
      },
    );

    if (!updatedTour) {
      throw new AppError('Tour does not exist', 404);
    }
  } catch (err) {
    throw new AppError('Tour does not exist', 400);
  }
};

// reviewSchema.pre('save', function (next) {
//   this.constructor
//     .calcAverageRatings(this.tour)
//     .then(() => {
//       next();
//     })
//     .catch((err) => {
//       next(err);
//     });
// });

reviewSchema.post('save', function (doc, next) {
  this.constructor
    .calcAverageRatings(doc.tour)
    .then(() => {
      next();
    })
    .catch((err) => {
      next(err);
    });
});

const Review = model('Review', reviewSchema);

module.exports = Review;
