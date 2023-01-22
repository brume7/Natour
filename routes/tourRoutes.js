const express = require('express');
const { protect, restrictTo } = require('../controllers/authController');
const { getAllReviews, createReview } = require('../controllers/reviewController');
const {
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  topFiveCheap,
  getTourStats,
  getMonthlyPlan
} = require('./../controllers/tourController');
const reviewRouter = require('./reviewRoutes');

const router = express.Router();

// router.param('id', checkID);

router.use(protect);

router.route('/tour-stats').get(getTourStats);
router.route('/monthly-plan/:year').get(getMonthlyPlan);
router.route('/top-5-cheap').get(topFiveCheap, getAllTours);
router.route('/').get(getAllTours).post(restrictTo('admin', 'lead-guide'), createTour);

router
  .route('/:id')
  .get(getTour)
  .patch(restrictTo('admin', 'lead-guide', 'guide'), updateTour)
  .delete(restrictTo('admin', 'lead-guide'), deleteTour);

router.use('/:tourId/reviews', reviewRouter);

module.exports = router;
