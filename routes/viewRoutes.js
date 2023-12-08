const express = require('express');
const { getAllToursView, getTourView, loginView, signUpView, logout, getMeView } = require('../controllers/viewController');
const { isLoggedIn } = require('../controllers/authController');
const router = express.Router();

router.use(isLoggedIn);

router.get('/', getAllToursView);

router.get('/tour/:slug', getTourView);
router.get('/login', loginView);
router.get('/sign-up', signUpView);
router.get('/logout', logout);
router.get('/me', getMeView);

module.exports = router;
