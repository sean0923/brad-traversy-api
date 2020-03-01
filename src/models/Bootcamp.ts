import mongoose from 'mongoose';
import slugify from 'slugify';
import { geocode } from '../helpers/geocode';

type Carrer =
  | 'WebDeveloper'
  | 'Mobile Development'
  | 'UI/UX'
  | 'Data Science'
  | 'Business'
  | 'Other';

interface Bootcamp extends mongoose.Document {
  name: string;
  slug: string;
  description: string;
  website: string;
  phone: string;
  email: string;
  address: undefined | string;
  location: {
    // GeoJSON Point
    type: 'Point';
    coordinates: number[];
    formattedAddress: string;
    street: string;
    city: string;
    state: string;
    zipcode: string;
    country: string;
  };
  careers: Carrer[];
  averageRating: number;
  averageCost: number;
  photo: string;
  createdAt: Date;
  userId: string;
}

const BootcampSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      unique: true,
      trim: true,
      maxlength: [50, 'Name can not be more than 50 characters'],
    },
    slug: String,
    description: {
      type: String,
      required: [true, 'Please add a description'],
      maxlength: [500, 'Description can not be more than 500 characters'],
    },
    website: {
      type: String,
      match: [
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
        'Please use a valid URL with HTTP or HTTPS',
      ],
    },
    phone: {
      type: String,
      maxlength: [20, 'Phone number can not be longer than 20 characters'],
    },
    email: {
      type: String,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email'],
    },
    address: {
      type: String,
      required: [true, 'Please add an address'],
    },
    location: {
      // GeoJSON Point
      type: {
        type: String,
        enum: ['Point'],
      },
      coordinates: {
        type: [Number],
        index: '2dsphere',
      },
      formattedAddress: String,
      street: String,
      city: String,
      state: String,
      zipcode: String,
      country: String,
    },
    careers: {
      // Array of strings
      type: [String],
      required: true,
      enum: ['Web Development', 'Mobile Development', 'UI/UX', 'Data Science', 'Business', 'Other'],
    },
    averageRating: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [10, 'Rating must can not be more than 10'],
    },
    averageCost: Number,
    photo: {
      type: String,
      default: 'no-photo.jpg',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    userId: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

BootcampSchema.virtual('courses', {
  ref: 'Course',
  localField: '_id',
  foreignField: 'bootcampId',
});

// slugify name
BootcampSchema.pre<Bootcamp>('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

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

// remove all courses in this bootcamp when remove
BootcampSchema.pre<Bootcamp>('remove', async function(next) {
  console.log(`delete all courses in bootcampId: ${this._id}`.green.inverse);
  await this.model('Course').deleteMany({ bootcampId: this._id });

  next();
});

export const BootcampModel = mongoose.model<Bootcamp>('Bootcamp', BootcampSchema);
