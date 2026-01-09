import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  // Only set up if not already connected (for tests that set up their own connection)
  if (mongoose.connection.readyState === 0) {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  }
});

afterAll(async () => {
  // Only disconnect if we created the connection
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
  }
});

afterEach(async () => {
  // Only clear if connected
  if (mongoose.connection.readyState !== 0) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  }
});

