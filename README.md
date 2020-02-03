## 22 Create Bootcamps

- postman preset

  ![alt text](./assets/postman-content-type-preset.png 'content-type-preset')

- !!! Express has built in body parser **finally** !!!

```ts
app.use(express.json());
```

- In models/Bootcamp.ts --> create bootcamp then send json back

```ts
export const createBootcamp: RequestHandler = async (req, res, next) => {
  try {
    const bootcamp = await BootcampModel.create(req.body);
    // 201 for creation
    res.status(201).json({ sucess: true, data: bootcamp });
  } catch (error) {
    res.status(400).json({ sucess: false, errMsg: error.errmsg });
  }
};
```

## 21 Add Bootcamp Model (and BootcampSchema)

- to models/Bootcamp.ts

## 20 Add npm package `colors` to give color to command line logs

```ts
console.log(`MONGO: connect to ${conn.connection.host}`.underline.cyan.bold);
```

## 19 Connect with Mongoose

- src/index.ts

When something wrong with mongoose promise or unhandledPromiseRejection in general,
kill log error message and kill server

```ts
const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

process.on('unhandledRejection', (err: any) => {
  console.log(`err: ${err.message}`);
  server.close(() => process.exit(1));
});
```

- connect to mongo with mongoose

```ts
export const connectDB = async () => {
  const conn = await mongoose.connect(process.env.MONGO_URI as string, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  });

  console.log(`MONGO: connect to ${conn.connection.host}`);
};
```

## 18 MongoDB Atlas

- DataAcess
  -- add new user

- NetworkAcess
  -- Add IP Address
  --- Add current IP Adress (my computer only)

## 17 Postman setup

## 16 Middleware

- make middlewares/loggers

```ts
export const logger: RequestHandler = (req, res, next) => {
  console.log(`${req.method} ${req.protocol}:${req.get('host')} ${req.originalUrl}`);
  next();
};
```

--> DELETE http:localhost:5000 /api/v1/bootcamps/123

- npm install morgan <-- logger middleware
  --> DELETE /api/v1/bootcamps/123 200 2.689 ms - 25

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
