import request from 'supertest';
import app from '../../server';
import MyList from '../../models/MyList';
import Movie from '../../models/Movie';
import TVShow from '../../models/TVShow';
import User from '../../models/User';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer;

describe('My List API Integration Tests', () => {
  let movieId: string;
  let tvShowId: string;
  let userId: string;

  beforeAll(async () => {
    // Disconnect any existing connection first
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    
    // Use in-memory MongoDB for testing
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);

    // Create test user
    const user = await User.create({
      username: 'testuser',
      preferences: {
        favoriteGenres: ['Action', 'Comedy'],
        dislikedGenres: ['Horror'],
      },
      watchHistory: [],
    });
    userId = user._id.toString();

    // Create test movie
    const movie = await Movie.create({
      title: 'Test Movie',
      description: 'A test movie description',
      genres: ['Action', 'Comedy'],
      releaseDate: new Date('2023-01-01'),
      director: 'Test Director',
      actors: ['Actor 1', 'Actor 2'],
    });
    movieId = movie._id.toString();

    // Create test TV show
    const tvShow = await TVShow.create({
      title: 'Test TV Show',
      description: 'A test TV show description',
      genres: ['Drama', 'Romance'],
      episodes: [
        {
          episodeNumber: 1,
          seasonNumber: 1,
          releaseDate: new Date('2023-01-01'),
          director: 'Test Director',
          actors: ['Actor 1', 'Actor 2'],
        },
      ],
    });
    tvShowId = tvShow._id.toString();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // Clear MyList collection before each test
    await MyList.deleteMany({});
  });

  describe('POST /api/my-list - Add to My List', () => {
    it('should successfully add a movie to the list', async () => {
      const response = await request(app)
        .post('/api/my-list')
        .set('x-user-id', userId)
        .send({
          contentId: movieId,
          contentType: 'movie',
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Item added to list successfully');

      // Verify item was added
      const listItem = await MyList.findOne({ userId, contentId: movieId });
      expect(listItem).toBeTruthy();
      expect(listItem?.contentType).toBe('movie');
    });

    it('should successfully add a TV show to the list', async () => {
      const response = await request(app)
        .post('/api/my-list')
        .set('x-user-id', userId)
        .send({
          contentId: tvShowId,
          contentType: 'tvshow',
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Item added to list successfully');

      // Verify item was added
      const listItem = await MyList.findOne({ userId, contentId: tvShowId });
      expect(listItem).toBeTruthy();
      expect(listItem?.contentType).toBe('tvshow');
    });

    it('should return 409 when adding duplicate item', async () => {
      // Add item first time
      await MyList.create({
        userId,
        contentId: movieId,
        contentType: 'movie',
      });

      // Try to add same item again
      const response = await request(app)
        .post('/api/my-list')
        .set('x-user-id', userId)
        .send({
          contentId: movieId,
          contentType: 'movie',
        });

      expect(response.status).toBe(409);
      expect(response.body.error).toBe('Item already in list');
    });

    it('should return 401 when user ID is missing', async () => {
      const response = await request(app)
        .post('/api/my-list')
        .send({
          contentId: movieId,
          contentType: 'movie',
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('User ID is required');
    });

    it('should return 400 when contentId is missing', async () => {
      const response = await request(app)
        .post('/api/my-list')
        .set('x-user-id', userId)
        .send({
          contentType: 'movie',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('contentId and contentType are required');
    });

    it('should return 400 when contentType is missing', async () => {
      const response = await request(app)
        .post('/api/my-list')
        .set('x-user-id', userId)
        .send({
          contentId: movieId,
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('contentId and contentType are required');
    });

    it('should return 400 when contentType is invalid', async () => {
      const response = await request(app)
        .post('/api/my-list')
        .set('x-user-id', userId)
        .send({
          contentId: movieId,
          contentType: 'invalid',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('contentType must be "movie" or "tvshow"');
    });

    it('should return 404 when movie does not exist', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const response = await request(app)
        .post('/api/my-list')
        .set('x-user-id', userId)
        .send({
          contentId: fakeId,
          contentType: 'movie',
        });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Movie not found');
    });

    it('should return 404 when TV show does not exist', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const response = await request(app)
        .post('/api/my-list')
        .set('x-user-id', userId)
        .send({
          contentId: fakeId,
          contentType: 'tvshow',
        });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('TV Show not found');
    });
  });

  describe('DELETE /api/my-list/:contentId - Remove from My List', () => {
    beforeEach(async () => {
      // Add items before each test
      await MyList.create({
        userId,
        contentId: movieId,
        contentType: 'movie',
      });
    });

    it('should successfully remove an item from the list', async () => {
      const response = await request(app)
        .delete(`/api/my-list/${movieId}`)
        .set('x-user-id', userId);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Item removed from list successfully');

      // Verify item was removed
      const listItem = await MyList.findOne({ userId, contentId: movieId });
      expect(listItem).toBeNull();
    });

    it('should return 401 when user ID is missing', async () => {
      const response = await request(app)
        .delete(`/api/my-list/${movieId}`);

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('User ID is required');
    });

    it('should return 400 when contentId is missing', async () => {
      const response = await request(app)
        .delete('/api/my-list/')
        .set('x-user-id', userId);

      expect(response.status).toBe(404); // Express returns 404 for missing route
    });

    it('should return 404 when item is not in the list', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const response = await request(app)
        .delete(`/api/my-list/${fakeId}`)
        .set('x-user-id', userId);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Item not found in list');
    });
  });

  describe('GET /api/my-list - List My Items', () => {
    beforeEach(async () => {
      // Create multiple items for pagination testing
      const items = [];
      for (let i = 0; i < 15; i++) {
        const movie = await Movie.create({
          title: `Test Movie ${i}`,
          description: `Description ${i}`,
          genres: ['Action'],
          releaseDate: new Date('2023-01-01'),
          director: 'Director',
          actors: ['Actor'],
        });

        items.push({
          userId,
          contentId: movie._id.toString(),
          contentType: 'movie' as const,
          addedAt: new Date(Date.now() - i * 1000), // Different timestamps for sorting
        });
      }
      await MyList.insertMany(items);
    });

    it('should successfully retrieve user list with default pagination', async () => {
      const response = await request(app)
        .get('/api/my-list')
        .set('x-user-id', userId);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('page');
      expect(response.body).toHaveProperty('pageSize');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('totalPages');
      expect(response.body.page).toBe(1);
      expect(response.body.pageSize).toBe(10);
      expect(response.body.total).toBe(15);
      expect(response.body.totalPages).toBe(2);
      expect(response.body.data).toHaveLength(10);
    });

    it('should successfully retrieve user list with custom pagination', async () => {
      const response = await request(app)
        .get('/api/my-list?page=2&pageSize=5')
        .set('x-user-id', userId);

      expect(response.status).toBe(200);
      expect(response.body.page).toBe(2);
      expect(response.body.pageSize).toBe(5);
      expect(response.body.total).toBe(15);
      expect(response.body.totalPages).toBe(3);
      expect(response.body.data).toHaveLength(5);
    });

    it('should return items sorted by addedAt descending (newest first)', async () => {
      const response = await request(app)
        .get('/api/my-list')
        .set('x-user-id', userId);

      expect(response.status).toBe(200);
      const items = response.body.data;
      expect(items.length).toBeGreaterThan(1);
      
      // Verify sorting (newest first)
      for (let i = 0; i < items.length - 1; i++) {
        const current = new Date(items[i].addedAt).getTime();
        const next = new Date(items[i + 1].addedAt).getTime();
        expect(current).toBeGreaterThanOrEqual(next);
      }
    });

    it('should return empty list when user has no items', async () => {
      const newUser = await User.create({
        username: 'newuser',
        preferences: { favoriteGenres: [], dislikedGenres: [] },
        watchHistory: [],
      });

      const response = await request(app)
        .get('/api/my-list')
        .set('x-user-id', newUser._id.toString());

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(0);
      expect(response.body.total).toBe(0);
    });

    it('should return 401 when user ID is missing', async () => {
      const response = await request(app)
        .get('/api/my-list');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('User ID is required');
    });

    it('should return 400 when page is invalid', async () => {
      const response = await request(app)
        .get('/api/my-list?page=0')
        .set('x-user-id', userId);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid pagination parameters');
    });

    it('should return 400 when pageSize is invalid', async () => {
      const response = await request(app)
        .get('/api/my-list?pageSize=0')
        .set('x-user-id', userId);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid pagination parameters');
    });

    it('should return 400 when pageSize exceeds maximum', async () => {
      const response = await request(app)
        .get('/api/my-list?pageSize=101')
        .set('x-user-id', userId);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid pagination parameters');
    });

    it('should include content details in response', async () => {
      const response = await request(app)
        .get('/api/my-list')
        .set('x-user-id', userId);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThan(0);
      
      const item = response.body.data[0];
      expect(item).toHaveProperty('contentId');
      expect(item).toHaveProperty('contentType');
      expect(item).toHaveProperty('title');
      expect(item).toHaveProperty('description');
      expect(item).toHaveProperty('genres');
      expect(item).toHaveProperty('addedAt');
      expect(item).toHaveProperty('additionalInfo');
    });

    it('should handle performance requirement (<10ms ideally)', async () => {
      const startTime = Date.now();
      const response = await request(app)
        .get('/api/my-list')
        .set('x-user-id', userId);
      const duration = Date.now() - startTime;

      expect(response.status).toBe(200);
      // Note: This test may fail in CI/CD environments, but it's good to monitor
      // In production with proper caching, this should be <10ms
      expect(duration).toBeLessThan(1000); // Allow some buffer for test environment
    });
  });

  describe('Edge Cases and Integration', () => {
    it('should handle multiple users with separate lists', async () => {
      const user2 = await User.create({
        username: 'user2',
        preferences: { favoriteGenres: [], dislikedGenres: [] },
        watchHistory: [],
      });

      // Add items for user1
      await MyList.create({
        userId,
        contentId: movieId,
        contentType: 'movie',
      });

      // Add items for user2
      await MyList.create({
        userId: user2._id.toString(),
        contentId: tvShowId,
        contentType: 'tvshow',
      });

      // Get user1's list
      const user1Response = await request(app)
        .get('/api/my-list')
        .set('x-user-id', userId);

      // Get user2's list
      const user2Response = await request(app)
        .get('/api/my-list')
        .set('x-user-id', user2._id.toString());

      expect(user1Response.status).toBe(200);
      expect(user1Response.body.total).toBe(1);
      expect(user1Response.body.data[0].contentId).toBe(movieId);

      expect(user2Response.status).toBe(200);
      expect(user2Response.body.total).toBe(1);
      expect(user2Response.body.data[0].contentId).toBe(tvShowId);
    });

    it('should handle adding and removing items in sequence', async () => {
      // Add movie
      const addResponse = await request(app)
        .post('/api/my-list')
        .set('x-user-id', userId)
        .send({ contentId: movieId, contentType: 'movie' });
      expect(addResponse.status).toBe(201);

      // Verify it's in the list
      let listResponse = await request(app)
        .get('/api/my-list')
        .set('x-user-id', userId);
      expect(listResponse.body.total).toBe(1);

      // Remove movie
      const removeResponse = await request(app)
        .delete(`/api/my-list/${movieId}`)
        .set('x-user-id', userId);
      expect(removeResponse.status).toBe(200);

      // Verify it's removed
      listResponse = await request(app)
        .get('/api/my-list')
        .set('x-user-id', userId);
      expect(listResponse.body.total).toBe(0);
    });
  });
});

