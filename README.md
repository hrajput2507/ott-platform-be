# My List Feature - OTT Platform Backend

A scalable, high-performance backend service for managing user's personalized list of movies and TV shows on an OTT platform.

## 🎯 Overview

This project implements a "My List" feature backend service that allows users to:

- Add movies and TV shows to their personalized list
- Remove items from their list
- Retrieve paginated list of saved items with high performance (<10ms target)

The service is built with TypeScript, Express.js, and MongoDB, following best practices for scalability, performance, and maintainability.

## ✨ Features

- **Add to My List**: Add movies or TV shows to user's list (prevents duplicates)
- **Remove from My List**: Remove items from user's list
- **List My Items**: Retrieve paginated list with content details
- **High Performance**: Optimized for <10ms response time for list queries
- **Comprehensive Testing**: Integration tests covering all endpoints and edge cases
- **Input Validation**: Middleware-based validation for all requests
- **Error Handling**: Proper error responses with error codes
- **Caching**: In-memory caching for improved performance
- **Rate Limiting**: Protection against abuse
- **Security**: Helmet.js for security headers

## 🛠 Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Testing**: Jest with Supertest
- **Security**: Helmet, CORS, Rate Limiting

## 📦 Prerequisites

- Node.js (v18 or higher)
- MongoDB (v5.0 or higher) - Local installation or MongoDB Atlas
- npm or yarn

## 🚀 Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd assesment
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` file with your MongoDB connection string and other configurations.

## ⚙️ Configuration

Create a `.env` file in the root directory with the following variables:

```env
MONGODB_URI=mongodb://localhost:27017/ott-platform
PORT=3000
NODE_ENV=development
```

## 🏃 Running the Application

### Development Mode

```bash
npm run dev
```

The server will start on `http://localhost:3000` (or the port specified in `.env`).

### Production Mode

```bash
npm run build
npm start
```

### Health Check

Visit `http://localhost:3000/health` to verify the server is running.

## 📚 API Documentation

### Base URL

```
http://localhost:3000/api/my-list
```

### Authentication

All endpoints require a user ID in the `x-user-id` header:

```
x-user-id: <user-id>
```

### Endpoints

#### 1. Add to My List

**POST** `/api/my-list`

Add a movie or TV show to the user's list.

**Request Body:**

```json
{
  "contentId": "movie-id-or-tvshow-id",
  "contentType": "movie" | "tvshow"
}
```

**Success Response (201):**

```json
{
  "message": "Item added to list successfully",
  "data": {
    "contentId": "movie-id",
    "contentType": "movie"
  }
}
```

**Error Responses:**

- `400`: Invalid request body
- `401`: Missing user ID
- `404`: Content not found
- `409`: Item already in list

#### 2. Remove from My List

**DELETE** `/api/my-list/:contentId`

Remove an item from the user's list.

**Success Response (200):**

```json
{
  "message": "Item removed from list successfully",
  "data": {
    "contentId": "movie-id"
  }
}
```

**Error Responses:**

- `401`: Missing user ID
- `404`: Item not found in list

#### 3. List My Items

**GET** `/api/my-list?page=1&pageSize=10`

Retrieve paginated list of items in user's list.

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `pageSize` (optional): Items per page (default: 10, max: 100)

**Success Response (200):**

```json
{
  "data": [
    {
      "contentId": "movie-id",
      "contentType": "movie",
      "title": "Movie Title",
      "description": "Movie description",
      "genres": ["Action", "Comedy"],
      "addedAt": "2024-01-15T10:00:00.000Z",
      "additionalInfo": {
        "releaseDate": "2023-01-01T00:00:00.000Z",
        "director": "Director Name",
        "actors": ["Actor 1", "Actor 2"]
      }
    }
  ],
  "page": 1,
  "pageSize": 10,
  "total": 25,
  "totalPages": 3
}
```

## 🧪 Testing

### Run All Tests

```bash
npm test
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### Test Coverage

Tests include:

- ✅ Success cases for all endpoints
- ✅ Error cases (400, 401, 404, 409, 500)
- ✅ Edge cases (duplicates, empty lists, pagination)
- ✅ Performance monitoring
- ✅ Multi-user scenarios

## 🌱 Database Seeding

Populate the database with sample data:

```bash
npm run seed
```

This creates:

- 3 sample users
- 10 movies
- 8 TV shows
- 8 My List entries

**Note**: The seed script will clear existing data before seeding.

## 🎨 Design Decisions

### Architecture

- **Layered Architecture**: Controllers → Services → Models
- **Separation of Concerns**: Business logic in services, HTTP handling in controllers
- **Middleware Pattern**: Validation and authentication handled via middleware

### Database Design

- **MongoDB**: Chosen for flexibility and scalability
- **Indexes**:
  - Compound unique index on `(userId, contentId)` to prevent duplicates
  - Compound index on `(userId, addedAt)` for efficient sorting and pagination
- **Lean Queries**: Using `.lean()` for faster queries when full Mongoose documents aren't needed

### Performance Optimizations

1. **Caching Strategy**:

   - In-memory cache for list queries (5-second TTL)
   - Separate cache for total count (10-second TTL)
   - Cache invalidation on add/remove operations

2. **Query Optimization**:

   - Proper indexing on frequently queried fields
   - Projection to fetch only required fields
   - Parallel queries for movies and TV shows
   - Early return for empty results

3. **Pagination**:
   - Efficient skip/limit with proper indexing
   - Cached total count to reduce database queries

### Error Handling

- Consistent error response format with error codes
- Proper HTTP status codes
- Detailed error messages for debugging
- Logging for monitoring and troubleshooting

### Security

- Helmet.js for security headers
- Rate limiting (100 requests per 15 minutes per IP)
- Input validation middleware
- CORS enabled

## 🚀 Performance Optimizations

### Target: <10ms Response Time

To achieve the <10ms target for "List My Items":

1. **Database Indexing**:

   - Compound index on `(userId, addedAt)` for efficient queries
   - Unique index on `(userId, contentId)` for duplicate prevention

2. **Caching**:

   - In-memory cache with 5-second TTL
   - Cache key includes userId, page, and pageSize
   - Cache invalidation on mutations

3. **Query Optimization**:

   - Lean queries (plain JavaScript objects)
   - Field projection (only fetch needed fields)
   - Parallel fetching of movies and TV shows
   - Early returns for empty results

4. **Production Recommendations**:
   - Use Redis for distributed caching
   - Consider read replicas for MongoDB
   - Implement connection pooling
   - Monitor query performance and optimize slow queries

**Note**: In production with Redis caching and proper infrastructure, the response time should consistently be under 10ms.

## 📝 Assumptions

1. **Authentication**: Basic user authentication is assumed to be in place. The service uses a mock user ID from the `x-user-id` header.

2. **Content Existence**: Movies and TV shows are assumed to exist in separate collections. The service validates content existence before adding to the list.

3. **User Model**: The User model includes preferences and watch history, but these are not directly used by the My List feature.

4. **Content Types**: Only two content types are supported: `movie` and `tvshow`.

5. **Pagination**: Default page size is 10, maximum is 100. This prevents excessive data transfer.

6. **Caching**: In-memory caching is used for development. Production should use Redis or similar distributed cache.

7. **Database**: MongoDB is used. The service assumes MongoDB is running and accessible.

8. **Error Handling**: Errors are logged to console. Production should use proper logging service (e.g., Winston, Pino).

9. **Performance**: The <10ms target is for cached responses. First request may take longer due to cache miss.

10. **Data Consistency**: The service ensures no duplicates using database unique constraints and application-level checks.

## 📁 Project Structure

## 🔍 Code Quality

- **TypeScript**: Strict mode enabled for type safety
- **ESLint**: Code linting (if configured)
- **Jest**: Comprehensive test coverage
- **Modular Design**: Separation of concerns
- **Error Handling**: Consistent error responses
- **Documentation**: Inline comments and JSDoc

## 🚢 Deployment

### Environment Variables for Production

```env
MONGODB_URI=<your-production-mongodb-uri>
PORT=3000
NODE_ENV=production
```

### Build for Production

```bash
npm run build
npm start
```
