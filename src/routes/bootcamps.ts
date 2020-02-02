import express from 'express';

export const bootcampsRouter = express.Router();

bootcampsRouter.get('/', (req, res) => {
  res.send('a');
});

bootcampsRouter.get('/:id', (req, res) => {
  res.send('a');
});

bootcampsRouter.post('/', (req, res) => {
  res.send('a');
});

bootcampsRouter.put('/:id', (req, res) => {
  res.send('a');
});

bootcampsRouter.delete('/:id', (req, res) => {
  res.send('a');
});
