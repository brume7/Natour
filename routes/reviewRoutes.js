const express = require('express');
const { protect, restrictTo } = require('../controllers/authController');
const {
  createReview,
  getAllReviews,
  deleteReview,
  updateReview,
  getReview,
  updateReviewCount,
} = require('../controllers/reviewController');

const router = express.Router({ mergeParams: true });

router.get('/update/tour/:tour', updateReviewCount);
router.use(protect);
router.route('/').get(getAllReviews).post(restrictTo('user'), createReview);

router
  .route('/:id')
  .get(getReview)
  .patch(restrictTo('admin', 'user'), updateReview)
  .delete(restrictTo('admin', 'user'), deleteReview);

module.exports = router;
