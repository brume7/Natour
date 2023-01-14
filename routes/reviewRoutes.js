const express = require('express');
const { protect, restrictTo } = require('../controllers/authController');
const { createReview, getAllReviews } = require('../controllers/reviewController');

const router = express.Router();

router.route('/').get(protect, restrictTo('admin', 'lead-guide'), getAllReviews).post(protect, createReview);

module.exports = router;
