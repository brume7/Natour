const express = require('express');
const morgan = require('morgan');
const tourRouter = require(`${__dirname}/routes/tourRoutes`);
const userRouter = require(`${__dirname}/routes/userRoutes`);
const errorController = require('./controllers/errorController');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const appError = require('./utils/appError');

const app = express();
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  message: 'too many request from this ip, please try agian in an hour!',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false // Disable the `X-RateLimit-*` headers
});

//1) Middlewares
//set security headers
app.use(helmet());
// dev logging
if (process.env.NODE_ENV == 'development') app.use(morgan('dev'));

//body paser for rq.body
app.use(
  express.json({
    limit: '10kb'
  })
);

// data sanitization against no-sql query injection
app.use(mongoSanitize());

// data sanitization against xss
app.use(xss());

//preventing parameter pollution
app.use(hpp({ whitelist: ['duration', 'difficulty', 'price', 'maxGroupSize', 'ratingsAverage', 'ratingsQuantity'] }));

//serving static files
app.use(express.static(`${__dirname}/public`));

//test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// limit request from same ip
app.use('/api', limiter);

//2) Routes

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
  const err = new appError(`can't find ${req.originalUrl} on this server`, 404);

  next(err);
});

app.use(errorController);

module.exports = app;
