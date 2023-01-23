const { Schema, model } = require('mongoose');

const reviewSchema = new Schema(
  {
    review: {
      type: String,
      trim: true,
      minlength: [5, 'Review must be longer than 5 characters '],
      maxlength: [255, 'Review must be less than 255 characters']
    },
    rating: {
      type: Number,
      min: [1, 'Rating must be bigger than 1'],
      max: [5, 'Rating must be less than 5'],
      required: 'Can not post review without a rating'
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false
    },
    tour: {
      type: Schema.Types.ObjectId,
      ref: 'Tour',
      required: true
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    toJSON: {
      virtuals: true
    },
    toObject: {
      virtuals: true
    }
  }
);

reviewSchema.pre(/^find/, function (next) {
  this.populate([
    {
      path: 'user',
      select: ' name email photo'
    }
  ]);

  next();
});

const Review = model('Review', reviewSchema);

module.exports = Review;
