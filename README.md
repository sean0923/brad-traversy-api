## 45. Set up signup

- controllers/auth
- routes/auth
- models/User

## 44. Middleware that can handle select, sort, page, limit, populate (advanced results middleware)

```ts
export interface ReqWithAdvancedResults extends Request {
  advancedResults: {
    success: boolean;
    data: any;
    count: number;
    pagination: {
      next?: number;
      prev?: number;
    };
  };
}

export const advancedResults = (model: Model<any>, populate: any) => async (
  req: ReqWithAdvancedResults,
  res: Response,
  next: NextFunction
) => {
  const queryStr = JSON.stringify(req.query);
  const queryStrWith$Sign = queryStr.replace(/\b(lt|gte|lte|gt|in)\b/g, (match) => '$' + match);
  const modifiedQuery = JSON.parse(queryStrWith$Sign);

  const keysToBeDeletedFromOriginalQueryStr = ['select', 'sort', 'page', 'limit'];

  keysToBeDeletedFromOriginalQueryStr.forEach((key) => delete modifiedQuery[key]);

  let query = model.find(modifiedQuery);

  if (req.query.select) {
    const selectBy = req.query.select.split(',').join(' ');
    query = query.select(selectBy);
  }

  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('createdAt');
  }

  // pagination
  const pagination: any = {};
  const page = req.query.page ? parseInt(req.query.page) : 1;
  const limit = req.query.limit ? parseInt(req.query.limit) : 25;
  const startIdx = (page - 1) * limit;
  const endIdx = page * limit;

  const total = await model.countDocuments();

  if (endIdx < total) {
    pagination.next = { page: page + 1, limit };
  }

  if (startIdx > 0) {
    pagination.prev = { page: page - 1, limit };
  }

  query = query.skip(startIdx).limit(limit);
  if (typeof populate === 'string') {
    query = query.populate(populate);
  } else {
    query = query.populate(populate.populate, populate.select);
  }

  const data = await query.exec();

  req.advancedResults = {
    success: true,
    count: data.length,
    pagination,
    data,
  };

  next();
};
```

then each route apply it like

- did not know apply middleware like this in below

```ts
bootcampsRouter
  .route('/')
  .get(advancedResults(BootcampModel, 'courses') as any, getBootcamps)
  .post(createBootcamp);
```

```ts
coursesRouter
  .route('/')
  .get(advancedResults(CourseModel, { populate: 'bootcampId', select: 'name' }) as any, getCourses)
  .post(createCourse);
```

## 43. Upload photo with express-fileupload

- use expressFileupload middleware at top of index.ts

```ts
// File upload
app.use(expressFileupload());
```

- controller/bootcamp
- with the middleware now req will have .files
- restrict to `image` and file size less than 1MB
- then update bootcamp `photo` field with name

```ts
// @ desc     upload bootcamp photo
// @ route    PATCH /api/v1/bootcamp/:id/photo
// @ access   Private
export const uploadPhoto: RequestHandler = asyncHandler(async (req, res, next) => {
  if (!req.files) {
    return next(new ErrorResponse('File is required', 400));
  }

  const file: UploadedFile = req.files.files as UploadedFile;

  if (!file.mimetype.startsWith('image')) {
    return next(new ErrorResponse('Only image can be uploaded', 400));
  }

  const fileSizeLimit = parseInt(process.env.UPLOAD_FILE_SIZE_LIMIT as string);
  if (file.size > fileSizeLimit) {
    return next(
      new ErrorResponse(`File size should be smaller than ${fileSizeLimit / 1000000}MB`, 400)
    );
  }

  const folderName = __dirname + `/../public/uploads`;
  const customFilename = `photo_${req.params.id}${path.extname(file.name)}`;

  file.mv(path.resolve(`${folderName}/${customFilename}`), async (err) => {
    if (err) {
      console.log('err: ', err);
      return next(new ErrorResponse(`Fail to upload file`, 500));
    }

    const updatedBootcamp = await BootcampModel.findOneAndUpdate(
      req.params.id,
      { photo: customFilename },
      { new: true }
    );

    res.status(200).json({ sucess: true, data: updatedBootcamp });
  });
});
```

- add acess to routes/bootcamps

- Set static folder `public` so that photo can be access from FE with url
- ex) http://localhost:5000/uploads/photo_5d725a1b7b292f5f8ceff788.jpg

```ts
// Set static folder
app.use(express.static(path.resolve(__dirname + '/./public')));
```

## 42. Aggregation (calculating the average cost)

- bootcamps.json -> remove averageCost
- seed.ts -> generate bootcamp only
- add statics method to CourseSchema
  -- inside of CourseSchema this shouold be availalbe to do `this.model('Bootcamp').findByIdAndUpdate`

```ts
CourseSchema.statics.updateAverageCost = async function(bootcampId: string) {
  const arrOfObj: { _id: string; averageCost: number }[] = await CourseModel.aggregate([
    { $match: { bootcampId: bootcampId } },
    { $group: { _id: '$bootcampId', averageCost: { $avg: '$tuition' } } },
  ]);

  try {
    const averageCost = Math.ceil(arrOfObj[0].averageCost);
    const updatedBootcamp = await this.model('Bootcamp').findByIdAndUpdate(
      bootcampId,
      { averageCost },
      { new: true }
    );
    console.log('updatedBootcamp: ', updatedBootcamp);
  } catch (error) {
    console.log('error: ', error);
  }
};

CourseSchema.post<Course>('save', async function(doc, next) {
  CourseModel.updateAverageCost(doc.bootcampId);
  next();
});

CourseSchema.post<Course>('remove', async function(doc, next) {
  CourseModel.updateAverageCost(doc.bootcampId);
  next();
});

export const CourseModel = mongoose.model<Course, CourseModelInterface>('Course', CourseSchema);
```

## 41. Update and Delete course

- similar to bootcamp

## 40. Get single course, Create course (by bootcamp owner)

- router/courses

```ts
coursesRouter
  .route('/')
  .get(getCourses)
  .post(createCourse);

coursesRouter.route('/:id').get(getCourse);
// ...
```

- controller/courses

```ts
// * C
// @ desc     create course
// @ route    POST /api/v1/bootcamps/:bootcampsId/courses
// @ access   Private (only bootcamp owner should be able to create)
export const createCourse: RequestHandler = asyncHandler(async (req, res, next) => {
  const bootcamp = await BootcampModel.findById(req.params.bootcampId);

  if (!bootcamp) {
    return next(new ErrorResponse(`Bootcamp id ${req.params.bootcampId} does not exist`, 404));
  }

  req.body.bootcampId = req.params.bootcampId;

  const course = await CourseModel.create(req.body);

  res.status(200).json({ sucess: true, data: course });
});
```

## 39. Populate, Virtuals, and delete Courses when bootcamp is `removed`

### ^^^ saves multiple req form front-end to backend

### think all of these could be done manually without using `populate, virtuals`

--- Populate

- one bootcamp has many courses (each course has bootcampId)
- use `populate` to replace bootcampId with bootcamp object

```ts
query.populate('bootcampId', 'name careers');

const allCourses = await query.exec();
```

--- Virtuals

- bootcamp does not have any info related to courses
- use `virtuals` to add virtual key courses to bootcamp obj

```ts
// at models/bootcamps.ts
// { toJSON: { virtuals: true } }
BootcampSchema.virtual('courses', {
  ref: 'Course',
  localField: '_id',
  foreignField: 'bootcampId',
});

// then can be populated at `controllers/bootcamps`
const singleBootcamp = await BootcampModel.findById(req.params.id).populate('courses');
```

--- Delete courses when bootcamp is `removed`

```ts
// remove all courses in this bootcamp when remove
BootcampSchema.pre<Bootcamp>('remove', async function(next) {
  console.log(`delete all courses in bootcampId: ${this._id}`.green.inverse);
  await this.model('Course').deleteMany({ bootcampId: this._id });

  next();
});
```

- findByIdAndDelete does not triger 'remove'
- So need to do

```ts
const bootcamp = await BootcampModel.findById(req.params.id);
bootcamp?.remove();
```

## 38. Courses controller and router

- get all courese will have two routes

1. get all courses from all bootcamps (/courses)
2. get all courses from one bootcamp (bootcamps/:bootcampId/courses)

- (2) start with bootcamps so need to re-route to courses controller when include /:bootcampId/courses

```ts
// Re-route into other router
router.use('/:bootcampId/courses', coursesRouter);
```

- index.ts

```ts
// Route files
import { bootcampsRouter } from './routes/bootcamps';
import { coursesRouter } from './routes/courses';
// ...
app.use(express.json());
app.use('/api/v1/bootcamps', bootcampsRouter);
app.use('/api/v1/courses', coursesRouter);
```

- routes/courses.ts

```ts
// ! mergeParams is required so that redirect from bootcamps/:bootcampId/courses contains req.params
export const coursesRouter = express.Router({ mergeParams: true });

// /courses/
// /bootcamps/:bootcampId/courses/
coursesRouter.route('/').get(getCourses);
```

```ts
// * R
// @ desc     Get all courses
// @ route    GET /api/v1/courses
// @ route    GET /api/v1/:bootcampId/courses
// @ access   Public
export const getCourses: RequestHandler = asyncHandler(async (req, res, next) => {
  let query = null;

  if (req.params.bootcampId) {
    query = CourseModel.find({ bootcampId: req.params.bootcampId });
  } else {
    query = CourseModel.find();
  }

  const allCourses = await query.exec();

  res.status(200).json({ sucess: true, count: allCourses.length, data: allCourses });
});
```

## 37. Course Model

then add to seed.ts

## 36. Add pagination

```ts
// pagination
const pagination: any = {};
const page = req.query.page ? parseInt(req.query.page) : 1;
const limit = req.query.limit ? parseInt(req.query.limit) : 25;
const startIdx = (page - 1) * limit;
const endIdx = page * limit;

const total = await BootcampModel.countDocuments();

if (endIdx < total) {
  pagination.next = { page: page + 1, limit };
}

if (startIdx > 0) {
  pagination.prev = { page: page - 1, limit };
}

query = query.skip(startIdx).limit(limit);
```

## 35. Building up query with sort and select functionality

- remove select and sort from original query str
- then build up query with select and sort

```ts
const keysToBeDeletedFromOriginalQueryStr = ['select', 'sort'];

keysToBeDeletedFromOriginalQueryStr.forEach((key) => delete modifiedQuery[key]);

let query = BootcampModel.find(modifiedQuery);

if (req.query.select) {
  const selectBy = req.query.select.split(',').join(' ');
  query = query.select(selectBy);
}

if (req.query.sort) {
  const sortBy = req.query.sort.split(',').join(' ');
  query = query.sort(sortBy);
}

const allBootcamps = await query.exec();
```

- forgot sort to be default with createdAt so

```ts
if (req.query.sort) {
  const sortBy = req.query.sort.split(',').join(' ');
  query = query.sort(sortBy);
} else {
  query = query.sort('createdAt');
}
```

## 34. Advanced filtering =,gte,let,in ...

```ts
const queryStr = JSON.stringify(req.query);
const queryStrWith$Sign = queryStr.replace(/\b(lt|gte|lte|gt|in)\b/g, (match) => '$' + match);
const modifiedQuery = JSON.parse(queryStrWith$Sign);
const allBootcamps = await BootcampModel.find(modifiedQuery);
```

## 33. Get bootcamps within radius

```ts
const _getBootcampsWithinRadius: RequestHandler = async (req, res, next) => {
  const { zipcode, distance } = req.params;
  const location = await geocode.geocode(zipcode);
  const lng = location[0].longitude;
  const lat = location[0].latitude;

  // If you use longitude and latitude, specify longitude first.
  const earthRadiusInMiles = 3693.2;
  const radius = parseFloat(distance) / earthRadiusInMiles;
  const bootcamps = await BootcampModel.find({
    // https://docs.mongodb.com/manual/reference/operator/query/centerSphere/
    // location: { $geoWithin: { $centerSphere: [[-88, 30], 10 / 3963.2] } },
    location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({ sucess: true, count: bootcamps.length, data: bootcamps });
};
```

## 32. Seeding Database Progrmatically

Really need to invoke dotenv early, even before import

```ts
// this need to be invoked early
dotenv.config({ path: './config/config.env' });

import { BootcampModel } from '../models/Bootcamp';
import { connectDB } from '../helpers/db';
```

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
