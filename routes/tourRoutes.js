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
  getMonthlyPlan,
  getToursWithin,
  getToursDistances
} = require('./../controllers/tourController');
const reviewRouter = require('./reviewRoutes');

const router = express.Router();

// router.param('id', checkID);
router.route('/').get(getAllTours);
router.route('/tour-stats').get(getTourStats);
router.route('/top-5-cheap').get(topFiveCheap, getAllTours);
router.get('/:id', getTour);
router.get('/tours-within/:distance/center/:latlng/unit/:unit', getToursWithin);
router.get('/distances/:latlng/unit/:unit', getToursDistances);

router.use(protect);

router.route('/monthly-plan/:year').get(restrictTo('admin', 'lead-guide'), getMonthlyPlan);
router.post('/', restrictTo('admin', 'lead-guide'), createTour);

router
  .route('/:id')
  .patch(restrictTo('admin', 'lead-guide'), updateTour)
  .delete(restrictTo('admin', 'lead-guide'), deleteTour);

router.use('/:tourId/reviews', reviewRouter);

module.exports = router;
