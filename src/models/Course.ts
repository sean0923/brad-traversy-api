import mongoose from 'mongoose';

// "_id": "5d725a4a7b292f5f8ceff789",
// "title": "Front End Web Development",
// "description": "This course will provide you with all of the essentials to become a successful frontend web developer. You will learn to master HTML, CSS and front end JavaScript, along with tools like Git, VSCode and front end frameworks like Vue",
// "weeks": 8,
// "tuition": 8000,
// "minimumSkill": "beginner",
// "scholarhipsAvailable": true,
// "bootcamp": "5d713995b721c3bb38c1f5d0",
// "user": "5d7a514b5d2c12c7449be045"

type MinimumSkill = 'beginner' | 'intermediate' | 'advance';

export interface Course extends mongoose.Document {
  title: string;
  description: string;
  weeks: number;
  tuition: number;
  minimumSkill: MinimumSkill;
  scholarshipsAvailable: boolean;
  bootcampId: string;
  user: string;
  createdAt: Date;
}

// model
export interface CourseModelInterface extends mongoose.Model<Course> {
  // here we decalre statics
  getAverageCost: (bootcampId: string) => void;
}

const CourseSchema = new mongoose.Schema<Course>({
  title: {
    type: String,
    required: [true, 'Please add a title'],
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
  },
  weeks: {
    type: Number,
    required: [true, 'Please add a weeks'],
  },
  tuition: {
    type: Number,
    required: [true, 'Please add a tuition'],
  },
  minimumSkill: {
    type: String,
    required: [true, 'Please add a weeks'],
    enum: ['beginner', 'intermediate', 'advance'],
  },
  bootcampId: {
    type: mongoose.Types.ObjectId,
    ref: 'Bootcamp',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

CourseSchema.statics.getAverageCost = async function(bootcampId: string) {
  const res = await CourseModel.aggregate([
    { $match: { bootcampId: bootcampId } },
    { $group: { _id: '$bootcampId', averageCost: { $avg: '$tuition' } } },
  ]);
  console.log('res: ', res);
};

CourseSchema.post<Course>('save', function(doc, next) {
  CourseModel.getAverageCost(doc.bootcampId);
  // CourseSchema.get
  // doc.getAverageCost
  // doc.constructor.(doc.bootcampId);
  // doc.constructor.getAverageCost(doc.model);
  // console.log('doc: ', doc);
  // console.log('this: ', this);
  // this.constructor
  // this.model.constructor(this.model).getAverageCost(doc.bootcampId);
  next();
});

CourseSchema.pre<Course>('remove', async function(next) {
  // this.
  next();
});

export const CourseModel = mongoose.model<Course, CourseModelInterface>('Course', CourseSchema);
