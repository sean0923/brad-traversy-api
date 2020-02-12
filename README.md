## 31. GeoCode Related

- hmm ... does not handle err case ... what if address is not correct ?
--> just error out becuase of error handler

npm install node-geocoder

initialize node-geocoder with options

```ts
import NodeGeocoder from 'node-geocoder';

var options = {
  provider: process.env.GEO_CODE_PROVIDER,

  // Optional depending on the providers
  httpAdapter: 'https', // Default
  apiKey: process.env.GEO_CODE_API_KEY, // for Mapquest, OpenCage, Google Premier
  formatter: null, // 'gpx', 'string', ...
};

export const geocode = NodeGeocoder(options as any);
```

```ts
// save location and remove address
// address --> geocdoe --> location
BootcampSchema.pre<Bootcamp>('save', async function(next) {
  if (this.address) {
    const location = await geocode.geocode(this.address);
    const firstLocation = location[0];

    this.location = {
      type: 'Point',
      coordinates: [firstLocation.longitude as number, firstLocation.latitude as number],
      city: firstLocation.city as string,
      country: firstLocation.countryCode as string,
      formattedAddress: firstLocation.formattedAddress as string,
      state: firstLocation.stateCode as string,
      street: firstLocation.streetName as string,
      zipcode: firstLocation.zipcode as string,
    };
  }

  // Do not save adress in DB
  this.address = undefined;
  next();
});
```

## 30. Mongoose Middleware with Slugify

npm install slugify

Before 'save' slugify the name for front-end url

```ts
BootcampSchema.pre<Bootcamp>('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});
```

## 29 Async Handler to reduce code (DRY)

```ts
try {
  const allBootcamps = await BootcampModel.find();
  res.status(200).json({ sucess: true, count: allBootcamps.length, data: allBootcamps });
} catch (error) {
  next(error);
}
```

can be reduce to

```ts
const allBootcamps = await BootcampModel.find();
res.status(200).json({ sucess: true, count: allBootcamps.length, data: allBootcamps });
```

by using

```ts
export const asyncHandler = (fn: RequestHandler) => (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  return Promise.resolve(fn(req, res, next)).catch((err) => next(err));
};
```

need to wrap controller func with asyncHandler

```ts
```

## 28 MongoDB duplicated key err, validation err

There are many more keys in mongo err (value, code, etc)

- dulicated key err

```ts
if (err.code === 11000 && err.keyValue) {
  tempErr = new ErrorResponse(`Duplication Err "key: ${JSON.stringify(err.keyValue)}"`, 400);
}
```

- validation err

```ts
if (err.name === 'ValidationError' && err.errors) {
  const message = Object.values(err.errors)
    .map((obj) => obj.message)
    .join(', ');

  tempErr = new ErrorResponse(message, 404);
}
```

## 27 MongoDB Cast Err (invalid id)

- not sure about handling err like this

```ts
// MongoDB bad _id format
if (err.name === 'CastError') {
  tempErr = new ErrorResponse(`Bootcamp not found with id of ${(err as any).value}`, 404);
}
```

## ErrorResponse Class

In controller, pass error to next function then next() function which takes flow to next middleware
Next middleware takes that error then send resp with res.status(...).json(...)

ErrorResponse Class is extending the error by

```ts
export class ErrorResponse extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}
```

So next() function will take this ErrorResponse instance instead of just error.
This way we have control over message and status code in neater way?

## 25 error handler middleware

- at controller catch pass error to next func

```ts
} catch (error) {
  // res.status(400).json({ sucess: false, errMsg: error.message });
  next(error);
}
```

- define error handler middleware

```ts
export const errorHandler = (err, req, res: Response, next) => {
  console.log(err.stack.red);

  res.status(400).json({
    success: false,
    errMsg: err.message,
  });
};
```

- at index.ts
- make sure errorHandler is placed after route

```ts
app.use(express.json());
app.use('/api/v1/bootcamps', bootcampsRouter);
// ! IMPORTANT ERR HANDLER MUST BE PLACED AFTER ROUTE STUFF
app.use(errorHandler);
```

## 24 Update and Delete

- Update

```ts
const updatedBootcamp = await BootcampModel.findByIdAndUpdate(req.params.id, req.body, {
  new: true, // without this it updates but return the not updated item
  runValidators: true,
});
```

- Delete

```ts
const deletedBootcamp = await BootcampModel.findByIdAndDelete(req.params.id);
```

## 23 Get Bootcamps and Single Bootcamp by id

- get bootcamps

```ts
export const getBootcamps: RequestHandler = async (req, res, next) => {
  try {
    const allBootcamps = await BootcampModel.find();
    res.status(200).json({ sucess: true, data: allBootcamps });
  } catch (error) {
    res.status(400).json({ sucess: false, errMsg: error.errmsg });
  }
};
```

- get a single bootcamp
  - need to handle case where bootcamp does not exist

```ts
export const getBootcamp: RequestHandler = async (req: Request, res, next) => {
  try {
    const singleBootcamp = await BootcampModel.findById(req.params.id);
    if (!singleBootcamp) {
      return res.status(400).json({ sucess: false, errMsg: 'bootcamp does not exsit' });
    }
    res.status(200).json({ sucess: true, data: singleBootcamp });
  } catch (error) {
    res.status(400).json({ sucess: false, errMsg: error.message });
  }
};
```

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
