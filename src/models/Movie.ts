import mongoose, { Schema, Document } from 'mongoose';
import { Genre } from '../types';

export interface IMovie extends Document {
  title: string;
  description: string;
  genres: Genre[];
  releaseDate: Date;
  director: string;
  actors: string[];
}

const MovieSchema: Schema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  genres: {
    type: [String],
    enum: ['Action', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Romance', 'SciFi'],
    required: true,
  },
  releaseDate: {
    type: Date,
    required: true,
  },
  director: {
    type: String,
    required: true,
  },
  actors: {
    type: [String],
    required: true,
  },
}, {
  timestamps: true,
});

MovieSchema.index({ title: 1 });
MovieSchema.index({ genres: 1 });

export default mongoose.model<IMovie>('Movie', MovieSchema);

