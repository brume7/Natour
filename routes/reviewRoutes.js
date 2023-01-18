const express = require('express');
const { protect, restrictTo } = require('../controllers/authController');
const { createReview, getAllReviews } = require('../controllers/reviewController');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(protect, restrictTo('admin', 'lead-guide'), getAllReviews)
  .post(protect, restrictTo('user'), createReview);

module.exports = router;
