const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const app = require(`${__dirname}/app`);
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose.set('strictQuery', true);

mongoose.connect(DB).then((con) => {
  console.log('Database connection sucessfull');
});

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`server is running on http://127.0.0.1:${port}/`);
});

process.on('unhandledRejection', (err) => {
  console.log('unhandled Rejection 💥 '.toUpperCase() + 'Shutting down');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
