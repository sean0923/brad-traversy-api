import mongoose from 'mongoose';

export interface Review extends mongoose.Document {
  title: string;
  description: string;
  rating: number;
  bootcampId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
}

export interface ReviewModelInterface extends mongoose.Model<Review> {
  // here we decalre statics
  updateAverateRatingAtBootcamp: (bootcampId: mongoose.Types.ObjectId) => void;
}

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

// Prevent user to submit more than one review per bootcamp
ReviewSchema.index({ bootcampId: 1, userId: 1 }, { unique: true });

ReviewSchema.statics.updateAverateRatingAtBootcamp = async function(bootcampId: string) {
  const arrOfObj: { _id: string; averageRating: number }[] = await ReviewModel.aggregate([
    { $match: { bootcampId: bootcampId } },
    { $group: { _id: '$bootcampId', averageRating: { $avg: '$rating' } } },
  ]);

  try {
    const averageRating = arrOfObj[0].averageRating;
    await this.model('Bootcamp').findByIdAndUpdate(bootcampId, { averageRating }, { new: true });
  } catch (error) {
    console.log('error: ', error);
  }
};

ReviewSchema.post<Review>('save', async function(doc, next) {
  ReviewModel.updateAverateRatingAtBootcamp(doc.bootcampId);
  next();
});

ReviewSchema.post<Review>('remove', async function(doc, next) {
  ReviewModel.updateAverateRatingAtBootcamp(doc.bootcampId);
  next();
});

export const ReviewModel = mongoose.model<Review, ReviewModelInterface>('Review', ReviewSchema);
