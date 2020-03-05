import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import expressFileupload from 'express-fileupload';
import cookieParser from 'cookie-parser';
import path from 'path';
import mongoSanitize from 'express-mongo-sanitize';
// import moduleName from './public/uploads'
// const mongoSanitize = require('express-mongo-sanitize');

import 'colors';

// this need to be invoked early
dotenv.config({ path: './config/config.env' });

//
import { logger } from './middlewares/loggers';
import { errorHandler } from './middlewares/error-handler';
import { connectDB } from './helpers/db';

// Route files
import { bootcampsRouter } from './routes/bootcamps';
import { coursesRouter } from './routes/courses';
import { authRouter } from './routes/auth';
import { usersRouter } from './routes/users';
import { reviewRouter } from './routes/reviews';

// connect to mongo DB
connectDB();

const isDev = process.env.NODE_ENV === 'development';

const app = express();

if (isDev) {
  app.use(logger);
  app.use(morgan('dev'));
}

// Set static folder
app.use(express.static(path.resolve(__dirname + '/./public')));

// File upload middleware
app.use(expressFileupload());
app.use(cookieParser());

// ! MONGO SANITIZE NEED TO AFTER `express.json()` !!!
app.use(express.json());
app.use(mongoSanitize());
// ! -------------------------------------------------
app.use('/api/v1/bootcamps', bootcampsRouter);
app.use('/api/v1/courses', coursesRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/reviews', reviewRouter);
// ! IMPORTANT ERR HANDLER MUST BE PLACED AFTER ROUTE STUFF
app.use(errorHandler);

const PORT = process.env.PORT || 6000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow);
});

process.on('unhandledRejection', (err: any) => {
  console.log(`err: ${err.message}`.underline.red.bold);
  server.close(() => process.exit(1));
});
