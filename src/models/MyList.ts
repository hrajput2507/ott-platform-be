import mongoose, { Schema, Document } from 'mongoose';

export interface IMyList extends Document {
  userId: string;
  contentId: string;
  contentType: 'movie' | 'tvshow';
  addedAt: Date;
}

const MyListSchema: Schema = new Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  contentId: {
    type: String,
    required: true,
  },
  contentType: {
    type: String,
    enum: ['movie', 'tvshow'],
    required: true,
  },
  addedAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
}, {
  timestamps: true,
});

// Compound index to prevent duplicates and optimize queries
MyListSchema.index({ userId: 1, contentId: 1 }, { unique: true });
// Index for sorting by addedAt
MyListSchema.index({ userId: 1, addedAt: -1 });

export default mongoose.model<IMyList>('MyList', MyListSchema);

