import mongoose, { Schema, Document } from 'mongoose';
import { Genre } from '../types';

export interface IUser extends Document {
  username: string;
  preferences: {
    favoriteGenres: Genre[];
    dislikedGenres: Genre[];
  };
  watchHistory: Array<{
    contentId: string;
    watchedOn: Date;
    rating?: number;
  }>;
}

const UserSchema: Schema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  preferences: {
    favoriteGenres: {
      type: [String],
      enum: ['Action', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Romance', 'SciFi'],
      default: [],
    },
    dislikedGenres: {
      type: [String],
      enum: ['Action', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Romance', 'SciFi'],
      default: [],
    },
  },
  watchHistory: [{
    contentId: { type: String, required: true },
    watchedOn: { type: Date, default: Date.now },
    rating: { type: Number, min: 1, max: 5 },
  }],
}, {
  timestamps: true,
});

UserSchema.index({ username: 1 });

export default mongoose.model<IUser>('User', UserSchema);

