const express = require('express');
const {
  signup,
  login,
  protect,
  restrictTo,
  forgotPassword,
  resetPassword,
  updatePassword
} = require('../controllers/authController');
const {
  getAllUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe
} = require('./../controllers/userController');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);
router.patch('/updatePassword', protect, updatePassword);
router.patch('/updateMe', protect, updateMe);
router.delete('/deleteMe', protect, deleteMe);

router.route('/').get(protect, restrictTo('admin'), getAllUsers).post(protect, restrictTo('admin'), createUser);
router
  .route('/:id')
  .get(protect, restrictTo('admin'), getUser)
  .patch(protect, restrictTo('admin'), updateUser)
  .delete(protect, restrictTo('admin'), deleteUser);

module.exports = router;
