const express = require('express');
const { getAllToursView, getTourView } = require('../controllers/viewController');
const router = express.Router();

router.get('/', getAllToursView);

router.get('/tour/:slug', getTourView);

module.exports = router;
