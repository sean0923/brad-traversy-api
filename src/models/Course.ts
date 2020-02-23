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
  minimumSkill: MinimumSkill;
  scholarshipsAvailable: boolean;
  bootcamp: string;
  user: string;
  createdAt: Date;
}

const CourseSchema = new mongoose.Schema({
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

export const CourseModel = mongoose.model<Course>('Course', CourseSchema);
