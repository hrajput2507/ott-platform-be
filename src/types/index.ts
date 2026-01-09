export type Genre = 'Action' | 'Comedy' | 'Drama' | 'Fantasy' | 'Horror' | 'Romance' | 'SciFi';

export interface User {
  id: string;
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

export interface Movie {
  id: string;
  title: string;
  description: string;
  genres: Genre[];
  releaseDate: Date;
  director: string;
  actors: string[];
}

export interface TVShow {
  id: string;
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

export interface MyListItem {
  userId: string;
  contentId: string;
  contentType: 'movie' | 'tvshow';
  addedAt: Date;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

