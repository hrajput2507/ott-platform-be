import mongoose, { Schema, Document } from 'mongoose';
import { Genre } from '../types';

export interface ITVShow extends Document {
  title: string;
  description: string;
  genres: Genre[];
  episodes: Array<{
    episodeNumber: number;
    seasonNumber: number;
    releaseDate: Date;
    director: string;
    actors: string[];
  }>;
}

const EpisodeSchema: Schema = new Schema({
  episodeNumber: {
    type: Number,
    required: true,
  },
  seasonNumber: {
    type: Number,
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
}, { _id: false });

const TVShowSchema: Schema = new Schema({
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
  episodes: {
    type: [EpisodeSchema],
    required: true,
  },
}, {
  timestamps: true,
});

TVShowSchema.index({ title: 1 });
TVShowSchema.index({ genres: 1 });

export default mongoose.model<ITVShow>('TVShow', TVShowSchema);

