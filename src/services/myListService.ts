import MyList from '../models/MyList';
import Movie from '../models/Movie';
import TVShow from '../models/TVShow';
import { PaginatedResponse } from '../types';

// Simple in-memory cache for performance optimization
// In production, consider using Redis
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5000; // 5 seconds cache TTL

interface ListItem {
  contentId: string;
  contentType: 'movie' | 'tvshow';
  title: string;
  description: string;
  genres: string[];
  addedAt: Date;
  additionalInfo?: any;
}

export class MyListService {
  /**
   * Add an item to user's list
   */
  async addToList(userId: string, contentId: string, contentType: 'movie' | 'tvshow'): Promise<void> {
    // Verify content exists
    if (contentType === 'movie') {
      const movie = await Movie.findById(contentId);
      if (!movie) {
        throw new Error('Movie not found');
      }
    } else {
      const tvShow = await TVShow.findById(contentId);
      if (!tvShow) {
        throw new Error('TV Show not found');
      }
    }

    // Check if already in list (handled by unique index, but checking for better error message)
    const existing = await MyList.findOne({ userId, contentId });
    if (existing) {
      throw new Error('Item already in list');
    }

    // Add to list
    await MyList.create({
      userId,
      contentId,
      contentType,
      addedAt: new Date(),
    });

    // Invalidate cache for this user
    this.invalidateUserCache(userId);
  }

  /**
   * Remove an item from user's list
   */
  async removeFromList(userId: string, contentId: string): Promise<void> {
    const result = await MyList.deleteOne({ userId, contentId });
    
    if (result.deletedCount === 0) {
      throw new Error('Item not found in list');
    }

    // Invalidate cache for this user
    this.invalidateUserCache(userId);
  }

  /**
   * Get user's list with pagination
   * Optimized for performance with proper indexing, caching, and aggregation
   * Target: <10ms response time
   */
  async getList(
    userId: string,
    page: number = 1,
    pageSize: number = 10
  ): Promise<PaginatedResponse<ListItem>> {
    const cacheKey = `list:${userId}:${page}:${pageSize}`;
    const totalCacheKey = `list:total:${userId}`;
    
    // Check cache first
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }

    const skip = (page - 1) * pageSize;

    // Optimize: Use parallel queries for list items and total count
    // Also cache total count separately as it changes less frequently
    let total: number;
    const cachedTotal = cache.get(totalCacheKey);
    if (cachedTotal && Date.now() - cachedTotal.timestamp < CACHE_TTL * 2) {
      total = cachedTotal.data;
    } else {
      total = await MyList.countDocuments({ userId });
      cache.set(totalCacheKey, { data: total, timestamp: Date.now() });
    }

    // Get list items with pagination (using compound index on userId and addedAt)
    // Using lean() for faster queries (returns plain JS objects)
    // Using projection to only fetch needed fields
    const listItems = await MyList.find(
      { userId },
      { contentId: 1, contentType: 1, addedAt: 1, _id: 0 }
    )
      .sort({ addedAt: -1 })
      .skip(skip)
      .limit(pageSize)
      .lean();

    // Early return if no items
    if (listItems.length === 0) {
      const emptyResponse: PaginatedResponse<ListItem> = {
        data: [],
        page,
        pageSize,
        total: 0,
        totalPages: 0,
      };
      cache.set(cacheKey, { data: emptyResponse, timestamp: Date.now() });
      return emptyResponse;
    }

    // Separate movie and TV show IDs for batch fetching
    const movieIds: string[] = [];
    const tvShowIds: string[] = [];
    
    listItems.forEach(item => {
      if (item.contentType === 'movie') {
        movieIds.push(item.contentId);
      } else {
        tvShowIds.push(item.contentId);
      }
    });

    // Parallel fetch of content details with projection for only needed fields
    const [movies, tvShows] = await Promise.all([
      movieIds.length > 0
        ? Movie.find(
            { _id: { $in: movieIds } },
            { title: 1, description: 1, genres: 1, releaseDate: 1, director: 1, actors: 1 }
          ).lean()
        : [],
      tvShowIds.length > 0
        ? TVShow.find(
            { _id: { $in: tvShowIds } },
            { title: 1, description: 1, genres: 1, episodes: 1 }
          ).lean()
        : [],
    ]);

    // Create maps for O(1) lookup
    const movieMap = new Map(movies.map(m => [m._id.toString(), m]));
    const tvShowMap = new Map(tvShows.map(t => [t._id.toString(), t]));

    // Combine list items with content details
    // Preserve order from listItems
    const items: ListItem[] = listItems.map(item => {
      const content = item.contentType === 'movie'
        ? movieMap.get(item.contentId)
        : tvShowMap.get(item.contentId);

      if (!content) {
        // Content might have been deleted, skip it
        return null;
      }

      return {
        contentId: item.contentId,
        contentType: item.contentType,
        title: content.title,
        description: content.description,
        genres: content.genres,
        addedAt: item.addedAt,
        additionalInfo: item.contentType === 'movie'
          ? {
              releaseDate: (content as any).releaseDate,
              director: (content as any).director,
              actors: (content as any).actors,
            }
          : {
              episodes: (content as any).episodes,
            },
      };
    }).filter(Boolean) as ListItem[];

    const response: PaginatedResponse<ListItem> = {
      data: items,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    };

    // Cache the response
    cache.set(cacheKey, { data: response, timestamp: Date.now() });

    return response;
  }

  /**
   * Invalidate cache for a user
   * Also invalidates the total count cache
   */
  private invalidateUserCache(userId: string): void {
    const keysToDelete: string[] = [];
    for (const key of cache.keys()) {
      if (key.startsWith(`list:${userId}:`) || key === `list:total:${userId}`) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => cache.delete(key));
  }

  /**
   * Clear all cache (useful for testing)
   */
  clearCache(): void {
    cache.clear();
  }
}

export default new MyListService();

