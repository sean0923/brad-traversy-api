## 72. PM2 for ?process manager?

In your server !!!

```
npm install pm2 -g
```

## 71. Digital Ocean Setup (Create Droplet and Server Login)

- add ssh key
- ssh root@<ip address>

---

if `Permission denied (publickey).`
then

- ssh-add ~/.ssh/id_rsa_digital_ocean

## 70. Documentation with Postman & DocGen

Mac

```
brew tap thedevsaddam/cli https://github.com/thedevsaddam/homebrew-cli.git
brew install docgen

# update

brew upgrade docgen
```

To make HTML documentation use

```
docgen build -i input-postman-collection.json -o index.html
```

## 69. Rate limiting, hpp, and cors

hpp - HTTP Parameter Pollution

```ts
// rate limit
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

app.use(limiter);

// hpp
app.use(hpp());

// cors enable cuz public API
app.use(cors());
```

## 68. Add Security Headers and XSS Protection

- npm install helmet
  (for security headers)

- npm install xss-clean
  (<script></script> --> &lt;script>&lt;/script>)

```ts
// add security headers
app.use(helmet());

// add xss proection (<script></script> --> &lt;script>&lt;/script>)
app.use(xss());
```

## 67. Prevent NOSQL injection and sanitize data

- currently below img works
  <img src="./assets/possible-db-injection.png">

- use express-mongo-sanitize so that \$gt and etc will not return data

npm install express-mongo-sanitize

!!!!!!!!!!!!!!!!!!!!!!!

- MONGO SANITIZE NEED TO BE AFTER `express.json()` !!!

```ts
app.use(express.json());
app.use(mongoSanitize());
```

```ts
app.use(mongoSanitize());
```

## 66. Logout to Clear Token Cookie

- src/middlewares/auth

```ts
// * if Bearere token does not exist then set token from cookie.token
if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
  token = req.headers.authorization.split(' ')[1];
} else if (req.cookies.token) {
  token = req.cookies.token;
}
```

- src/controllers/auth

```ts
// * (Sign Out)
// @ desc     signout
// @ route    GET /api/v1/auth/signout
// @ access   Public
export const signout = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  res.cookie('token', 'nono', { expires: new Date(Date.now() + 10 * 60 * 1000), httpOnly: true });
  res.status(200).send({ success: true, data: {} });
});
```

## 63 ~ 65. CUD functionality for reviews

63 - create review

```ts
// only one review is allowed for one bootcamp per  user
// Prevent user to submit more than one review per bootcamp
ReviewSchema.index({ bootcampId: 1, userId: 1 }, { unique: true });
```

64 - aggregate average rating
65 - update and delete review

## 61. Seed reviews and get single review

```ts
// * R (single)
// @ desc     Get a single review
// @ route    GET /api/v1/reivews/:id
// @ access   Public
export const getReview = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  let query = ReviewModel.findById(req.params.id);

  query.populate('bootcampId', 'name careers');

  const singleReview = await query.exec();
  if (!singleReview) {
    return next(new ErrorResponse(`Review id ${req.params.id} does not exist`, 404));
  }

  res.status(200).json({ sucess: true, data: singleReview });
});
```

## 60. ReviewModel and get reviews

- similar to get courses

## 59. CRUD users API for admin users

```ts
export const usersRouter = express.Router();

// * this way, protect and authorize is applied to all router below ---------
usersRouter.use(protect);
usersRouter.use(authorize('admin') as any);
// * ------------------------------------------------------------------------

usersRouter
  .route('/')
  .get(advancedResults(UserModel, 'users') as any, getUsers)
  .post(createUser);

usersRouter
  .route('/:id')
  .get(getUser)
  .patch(updateUser)
  .delete(deleteUser);
```

## 58. Update my info and password

```ts
// * U
// @ desc     update my info (name, email)
// @ route    PATCH /api/v1/auth/update-my-info
// @ access   Private
export const updateMyInfo = asyncHandler(
  async (req: ReqWithUser, res: Response, next: NextFunction) => {
    const { name, email } = req.body;

    if (!name || !email) {
      return next(new ErrorResponse('name and email are required', 400));
    }

    const user = req.user;
    user.name = name;
    user.email = email;

    await user.save({ validateBeforeSave: true });

    resSendJwt(res, user);
  }
);

// * U
// @ desc     update my password
// @ route    PATCH /api/v1/auth/update-my-password
// @ access   Private
export const updateMyPassword = asyncHandler(
  async (req: ReqWithUser, res: Response, next: NextFunction) => {
    const { currentPassword, newPassword } = req.body;

    const wrongPassword = !(await req.user.asyncCheckPassword(currentPassword));

    if (wrongPassword) {
      return next(new ErrorResponse('Wrong password', 400));
    }

    if (!newPassword) {
      return next(new ErrorResponse('new password is required', 400));
    }

    const user = req.user;
    user.password = newPassword;

    await user.save({ validateBeforeSave: true });

    resSendJwt(res, user);
  }
);
```

## 57. Reset password ()

---

If you define something undefined then mongoose does not save to DB

ex) both key will be not saved at DB

```ts
user.resetPasswordToken = undefined;
user.resetPasswordExpire = undefined;
```

---

```ts
// * U (Reset password)
// @ desc     forgot password
// @ route    PATCH /api/v1/auth/reset-password/:resetPasswordToken
// @ access   Public
export const resetPassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { resetPasswordToken } = req.params;
    const hasedResetPasswordToken = crypto
      .createHash('sha256')
      .update(resetPasswordToken)
      .digest('hex');

    const user = await UserModel.findOne({ resetPasswordToken: hasedResetPasswordToken });

    if (!user) {
      return next(new ErrorResponse('Invalid resetPasswordToken', 400));
    }

    const { newPassword } = req.body;

    user.password = newPassword;
    user.resetPasswordExpire = undefined;
    user.resetPasswordToken = undefined;

    await user.save();

    resSendJwt(res, user);
  }
);
```

## 56. Forgot password - send email with `mailtrap` and `nodemailer`

- npm install nodemailer

- send email helper function

```ts
export const sendEmail = async (options: Options) => {
  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_USER_EMAIL as string),
    auth: {
      user: process.env.SMTP_USER_EMAIL, // generated ethereal user
      pass: process.env.SMTP_PASSWORD, // generated ethereal password
    },
  });

  const message = {
    from: `${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM_EMAIL}>`, // sender address
    to: options.email,
    subject: options.subject, // Subject line
    text: options.text, // plain text body
  };

  // send mail with defined transport object
  const info = await transporter.sendMail(message);

  console.log('info: ', info);
};
```

- add to forgot password controller

```ts
// * (ForgotPassword)
// @ desc     forgot password
// @ route    GET /api/v1/auth/forgot-password
// @ access   Public
export const forgotPassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await UserModel.findOne({ email: req.body.email });

    if (!user) {
      return next(new ErrorResponse(`No user with email ${req.body.email}`, 400));
    }

    const resetToken = user.getResetPasswordToken();

    // saving hashed restPasswordToken
    await user.save({ validateBeforeSave: false }); // name, ... are not required

    const currentHost = req.get('host');
    const resetUrl = `${req.protocol}://${currentHost}/api/v1/auth/reset-password/${resetToken}`;
    const emailBody = `Please send PATCH request to url: ${resetUrl}`;

    try {
      await sendEmail({ email: user.email, subject: 'Subject', text: emailBody });
      res.status(200).send({ success: true, text: 'Email sent' });
    } catch (error) {
      user.resetPasswordExpire = null;
      user.resetPasswordToken = null;
      await user.save({ validateBeforeSave: false }); // so that reset info is not hanging
      return next(new ErrorResponse(`Something wrong happen while sending email`, 500));
    }
  }
);
```

## 55. Forgot password return resetToken

Since forgot password req body only takes email, we need to handle pre save case where there is no password

```ts
UserSchema.pre<User>('save', async function(next) {
  if (!this.password) {
    next(); // for forgot password
  }
```

get non-hashed and hashed reset token by using native node lb `crypto`

```ts
UserSchema.methods.getResetPasswordToken = function() {
  const resetToken = crypto.randomBytes(20).toString('hex');

  const hashedResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.resetPasswordToken = hashedResetToken;
  this.resetPasswordExpire = dateFns.addMinutes(new Date(), 10);

  return resetToken;
};
```

---

Return non-hashed reset token as response and save hashed token in user

```ts
// * (ForgotPassword)
// @ desc     forgot password
// @ route    GET /api/v1/auth/forgot-password
// @ access   Public
export const forgotPassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await UserModel.findOne({ email: req.body.email });

    if (!user) {
      return next(new ErrorResponse(`No user with email ${req.body.email}`, 400));
    }

    const resetToken = user.getResetPasswordToken();

    // saving hashed restPasswordToken
    await user.save({ validateBeforeSave: false }); // name, ... are not required

    res.status(200).send({ success: true, resetToken });
  }
);
```

## 54. Only let course owner to change course info

- make sure to add userId to Course Schema
- example

```ts
export const createCourse = asyncHandler(
  async (req: ReqWithUser, res: Response, next: NextFunction) => {
    const bootcamp = await BootcampModel.findById(req.params.bootcampId);
    console.log('bootcamp: ', bootcamp);

    if (!bootcamp) {
      return next(new ErrorResponse(`Bootcamp id ${req.params.bootcampId} does not exist`, 404));
    }

    checkOwnerBeforeDbOperation(bootcamp, 'course', 'create', req, next);

    req.body.bootcampId = req.params.bootcampId;
    req.body.userId = req.user.id;

    const course = await CourseModel.create(req.body);

    res.status(200).json({ sucess: true, data: course });
  }
);
```

## 54. Only let owner to change bootcamp info

In update bootcamp.

- find bootcamp by bootcamp id
- get user id from bootcamp = bootcamp owner user id
- req.user.\_id !== bootcamp owner user id then reject
- if user is not owner or not admin then they cannot udate or delete bootcamp

- need to set `protect` middleware to update and delete in order to access req.user

---

typeof user.bootcampId = object
typeof user.id = string
typeof user.\_id = object

---

- implement check-owner-before-db-operation

```ts
interface MustHaveKey_userId {
  userId: mongoose.Types.ObjectId;
  [key: string]: any;
}

export function checkOwnerBeforeDbOperation(
  instance: MustHaveKey_userId | null,
  instanceName: 'bootcamp' | 'course',
  dbOperationName: 'update' | 'upload photo' | 'delete',
  req: ReqWithUser,
  next: NextFunction
) {
  const notOwner = (instance as any).userId.toString() !== req.user.id;
  const notAdmin = req.user.role !== 'admin';

  if (notOwner && notAdmin) {
    return next(
      new ErrorResponse(
        `User id: ${req.user.id} is not authorized to ${dbOperationName} this ${instanceName}`,
        401
      )
    );
  }
}
```

## 53. Set up bootcamp and user relationship (and update seed.ts)

... forgot what i did here ...

## 52. Role Authorization

- authorize middleare

```ts
export const authorize = (...roles: string[]) => (
  req: ReqWithUser,
  res: Response,
  next: NextFunction
) => {
  const isAuthorized = roles.includes(req.user.role);

  if (!isAuthorized) {
    return next(
      new ErrorResponse(`user role ${req.user.role} is not authorize to perform this action`, 403)
    );
  }

  next();
};
```

- make sure place it after protect to get req.user

```ts
coursesRouter
  .route('/:id')
  .get(getCourse)
  .patch(updateCourse)
  .delete(protect, authorize('admin', 'publisher') as any, deleteCourse); //! protect then authorize! order MATTERS!
```

## 51. Postman test tab for easier Authorization

- test tab
  <img src="./assets/postman-test-tab.png">

- auth tab
  <img src="./assets/postman-auth-tab.png">

## 50. Auth Protect Middleware

/middlewraes/auth

```ts
export const protect = asyncHandler(async (req: ReqWithUser, res: Response, next: NextFunction) => {
  const token = getToken(req);

  if (!token) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  const decodedJwt = jwt.verify(token, process.env.JWT_SECRET as string);

  try {
    const user = await UserModel.findById((decodedJwt as any).id);

    if (!user) {
      return next(new ErrorResponse('User does not exist', 400));
    }

    // from this line user will be available at req
    // in otherwords, req.user will be availble for all protected routes
    req.user = user;

    next();
  } catch (error) {
    return next(error);
  }
});
```

- /api/vi/auth/me
- get me route to get my info

```ts
authRouter.route('/my-info').get(protect, getMyInfo);
```

## 49. Sending JWT in a Cookie

npm install cookie-parser
npm install date-fns

```ts
const resSendJwt = (res: Response, user: User) => {
  const token = user.getJwtWithExpireTime();

  const option: any = {
    expires: Date.now(),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') {
    option.secure = true;
  }

  const cookieExpireDays = parseInt(process.env.COOKIE_EXPIRE_DAYS as string);

  res
    .status(200)
    .cookie('token', token, {
      expires: dateFns.addDays(new Date(), cookieExpireDays),
      httpOnly: true,
      ...(process.env.NODE_ENV === 'production' && { secure: true }),
    })
    .json({ sucess: true, token });
};
```

## 48. Signin (check password --> return JWT)

- check password
- return jwt

-- models/User

```ts
UserSchema.methods.asyncCheckPassword = function(enteredPassword: string) {
  return bcrypt.compare(enteredPassword, this.password);
};
```

-- controller/auth

```ts
// @ desc     signin
// @ route    POST /api/v1/auth/signin
// @ access   Public
export const signin = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  const user = await UserModel.findOne({ email }).select('password'); // select password because in schema level select password false

  if (!user) {
    return next(new ErrorResponse('Invalid user credentials', 400));
  }

  const isCorrectPassword = await user.asyncCheckPassword(password);

  if (!isCorrectPassword) {
    return next(new ErrorResponse('Invalid user credentials', 400));
  }

  const token = user.getJwtWithExpireTime();

  res.status(200).json({ sucess: true, token });
});
```

-- routes/auth

```ts
authRouter.route('/signin').post(signin);
```

## 47. Json Web Token (JWT)

- npm install jsonwebtoken types/jsonwebtoken

- return jwt when user is created

```ts
const user = await UserModel.create({ name, email, password, role });
const token = user.getJwtWithExpireTime();

res.status(200).json({ sucess: true, token });
```

### 46. Create user (sign up?)

- bcryptjs (there is lb bcrypt but seems to have issue on window, so use bcryptjs)

## 45. Set up signup

- controllers/auth
- routes/auth
- models/User

---

#### controllers/auth

```ts
// * C
// @ desc     signUp new user
// @ route    POST /api/v1/sign-up
// @ access   Public
export const signupNewUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({ sucess: true });
  }
);
```

---

#### routes/auth

```ts
export const authRouter = express.Router();

// api/v1/auth/
authRouter.route('/').post(signupNewUser);
```

---

#### models/User

```ts
type Role = 'user' | 'publisher';

interface User extends mongoose.Document {
  name: string;
  email: string;
  password: string;
  role: Role;
  resetPasswordToken: string;
  resetPasswordExpire: Date;
  createdAt: Date;
}

const emialRegex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;

const UserSchema = new mongoose.Schema<User>({
  name: { type: String, required: [true, 'Please add a name'] },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [emialRegex, 'Please add valid email'],
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false, // select false to not return password to client
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const UserModel = mongoose.model<User>('User', UserSchema);
```

## 44. Middleware that can handle select, sort, page, limit, populate (advanced results middleware)

```ts
export interface ResWithAdvancedResults extends Request {
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
  req: Request,
  res: ResWithAdvancedResults,
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
