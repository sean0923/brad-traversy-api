## 15 Controllers

- controls what happens at api endpoint

- In `src/routes/bootcamps.ts`

```ts
export const bootcampsRouter = express.Router();

bootcampsRouter
  .route('/')
  .get(getBootcamps)
  .post(createBootcamp);

bootcampsRouter
  .route('/:id')
  .get(getBootcamp)
  .put(updateBootcamp)
  .delete(deleteBootcamp);
```

- In `src/controllers/bootcamps.ts`

```ts
// @ desc     Get all bootcamps
// @ route    GET /api/v1/bootcamps
// @ access   Public
export const getBootcamps: RequestHandler = (req, res, next) => {
  res.status(200).json({ msg: 'get all bootcamps' });
};

// @ desc     Get a single bootcamp
// @ route    GET /api/v1/bootcamp/:id
// @ access   Public
export const getBootcamp: RequestHandler = (req, res, next) => {
  res.status(200).json({ msg: 'get a single bootcamp' });
};
```

## Seperate router from index.ts

In `src/index

```js
// Route files
import { bootcampsRouter } from './routes/bootcamps';
// ...
app.use('/api/v1/bootcamps', bootcampsRouter);
```

In `src/routes/bootcampes

```js
export const bootcampsRouter = express.Router();

bootcampsRouter.get('/', (req, res) => {
  res.send('a');
});
```
