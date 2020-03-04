import mongoose from 'mongoose';

export interface Review extends mongoose.Document {
  title: string;
  description: string;
  rating: number;
  bootcampId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
}

// model
// export interface CourseModelInterface extends mongoose.Model<Course> {
//   // here we decalre statics
//   updateAverageCost: (bootcampId: string) => void;
// }

const ReviewSchema = new mongoose.Schema<Review>({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    maxlength: 100,
  },
  text: {
    type: String,
    required: [true, 'Please add a description'],
  },
  rating: {
    type: Number,
    min: 1,
    max: 10,
    required: [true, 'Please add rating'],
  },
  bootcampId: {
    type: mongoose.Types.ObjectId,
    ref: 'Bootcamp',
    required: true,
  },
  userId: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const ReviewModel = mongoose.model<Review>('Review', ReviewSchema);
