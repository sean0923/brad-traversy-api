import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import 'colors';
// require('colors');

//
import { logger } from './middlewares/loggers';
import { connectDB } from './helpers/db';

// Route files
import { bootcampsRouter } from './routes/bootcamps';

// dotenv.config({ path: "../config/config.env" });
dotenv.config({ path: './config/config.env' });

// connect to mongo DB
connectDB();

const isDev = process.env.NODE_ENV === 'development';

const app = express();

if (isDev) {
  app.use(logger);
  app.use(morgan('dev'));
}

app.use(express.json());
app.use('/api/v1/bootcamps', bootcampsRouter);

const PORT = process.env.PORT || 6000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow);
});

process.on('unhandledRejection', (err: any) => {
  console.log(`err: ${err.message}`.underline.red.bold);
  server.close(() => process.exit(1));
});
