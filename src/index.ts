import express from 'express';
import dotenv from 'dotenv';

// Route files
import { bootcampsRouter } from './routes/bootcamps';

// dotenv.config({ path: "../config/config.env" });
dotenv.config({ path: './config/config.env' });

const app = express();

app.use('/api/v1/bootcamps', bootcampsRouter);

const PORT = process.env.PORT || 6000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
