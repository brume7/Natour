const Tour = require('../models/tourModel');
const catchAsync = require('./../utils/catchAsync');
const nonce = require('crypto').randomBytes(16).toString('base64');

exports.getAllToursView = catchAsync(async (req, res) => {
  const tours = await Tour.find({});
  res.status(200).render('index', {
    title: 'Natours | tours',
    nonce: nonce,
    tours,
  });
});

exports.getTourView = catchAsync(async (req, res) => {
  const { slug } = req.params;

  const tour = await Tour.findOne({ slug }).populate([
    {
      path: 'reviews',
      select: 'review rating user -tour',
    },
  ]);

  if (!tour) {
    return res.status(200).render('404', {
      title: 'Natours | 404',
    });
  }

  res.status(200).render('tour', {
    title: `Natours | ${tour.name}`,
    nonce: nonce,
    tour,
  });
});

exports.loginView = catchAsync(async (req, res) => {
  if (res.locals.user) {
    return res.redirect('/');
  }
  return res.status(200).render('login', {
    title: `Natorus | Login`,
  });
});

exports.signUpView = catchAsync(async (req, res) => {
  if (res.locals.user) {
    return res.redirect('/');
  }
  return res.status(200).render('signUp', {
    title: `Natorus | sign up`,
  });
});

exports.logout = catchAsync(async (req, res) => {
  res.clearCookie('jwt'); // Replace 'yourCookieName' with the actual name of your cookie

  // Redirect to '/'
  res.redirect('/');
});
