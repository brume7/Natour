const path = require('path');
const express = require('express');
const morgan = require('morgan');
const tourRouter = require(`${__dirname}/routes/tourRoutes`);
const userRouter = require(`${__dirname}/routes/userRoutes`);
const reviewRouter = require(`${__dirname}/routes/reviewRoutes`);
const viewRouter = require(`${__dirname}/routes/viewRoutes`);
const errorController = require('./controllers/errorController');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const appError = require('./utils/appError');
const cookieParser = require('cookie-parser');

const app = express();
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  message: 'too many request from this ip, please try agian in an hour!',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false // Disable the `X-RateLimit-*` headers
});

// Set 'views' to the folder where your Pug files are stored
app.set('views', path.join(__dirname, 'views'));

// Set the view engine to Pug
app.set('view engine', 'pug');

//1) Middlewares
//set security headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", '*'],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", '*', 'blob:'], // Add 'blob:'
        styleSrc: ["'self'", "'unsafe-inline'", '*'],
        fontSrc: ["'self'", '*'],
        imgSrc: ["'self'", '*', 'data:'],
        connectSrc: ["'self'", '*'],
        mediaSrc: ["'self'", '*'],
        objectSrc: ["'none'"],
        frameSrc: ['*'],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        frameAncestors: ["'self'"]
      }
    },
    crossOriginResourcePolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false
  })
);
// dev logging
if (process.env.NODE_ENV == 'development') app.use(morgan('dev'));

//body paser for rq.body
app.use(
  express.json({
    limit: '10kb'
  })
);

//cookie parser
app.use(cookieParser());

// data sanitization against no-sql query injection
app.use(mongoSanitize());

// data sanitization against xss
app.use(xss());

//preventing parameter pollution
app.use(hpp({ whitelist: ['duration', 'difficulty', 'price', 'maxGroupSize', 'ratingsAverage', 'ratingsQuantity'] }));

//serving static files
app.use(express.static(path.join(__dirname, 'public')));

//test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  console.log(req.cookies);
  next();
});

// limit request from same ip
app.use('/api', limiter);

//2) Routes

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

app.all('*', (req, res, next) => {
  res.status(200).render('404', {
    title: 'Natours | 404'
  });
});

app.use(errorController);

module.exports = app;
