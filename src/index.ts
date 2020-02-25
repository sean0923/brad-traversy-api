import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import expressFileupload from 'express-fileupload';
import path from 'path';
// import moduleName from './public/uploads'

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

// File upload
app.use(expressFileupload());

app.use(express.json());
app.use('/api/v1/bootcamps', bootcampsRouter);
app.use('/api/v1/courses', coursesRouter);
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
