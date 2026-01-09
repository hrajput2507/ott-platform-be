import dotenv from 'dotenv';
import User from '../models/User';
import Movie from '../models/Movie';
import TVShow from '../models/TVShow';
import MyList from '../models/MyList';
import { connectDatabase, disconnectDatabase } from '../config/database';

dotenv.config();

const seedData = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    await connectDatabase();

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Movie.deleteMany({});
    await TVShow.deleteMany({});
    await MyList.deleteMany({});

    // Create Users
    console.log('👥 Creating users...');
    const users = await User.insertMany([
      {
        username: 'john_doe',
        preferences: {
          favoriteGenres: ['Action', 'SciFi', 'Drama'],
          dislikedGenres: ['Horror'],
        },
        watchHistory: [
          {
            contentId: 'movie1',
            watchedOn: new Date('2024-01-15'),
            rating: 5,
          },
        ],
      },
      {
        username: 'jane_smith',
        preferences: {
          favoriteGenres: ['Comedy', 'Romance', 'Drama'],
          dislikedGenres: ['Horror', 'SciFi'],
        },
        watchHistory: [
          {
            contentId: 'tvshow1',
            watchedOn: new Date('2024-02-01'),
            rating: 4,
          },
        ],
      },
      {
        username: 'alex_jones',
        preferences: {
          favoriteGenres: ['Fantasy', 'Action'],
          dislikedGenres: [],
        },
        watchHistory: [],
      },
    ]);
    console.log(`✅ Created ${users.length} users`);

    // Create Movies
    console.log('🎬 Creating movies...');
    const movies = await Movie.insertMany([
      {
        title: 'The Matrix',
        description: 'A computer hacker learns about the true nature of reality and his role in the war against its controllers.',
        genres: ['Action', 'SciFi'],
        releaseDate: new Date('1999-03-31'),
        director: 'Lana Wachowski, Lilly Wachowski',
        actors: ['Keanu Reeves', 'Laurence Fishburne', 'Carrie-Anne Moss'],
      },
      {
        title: 'Inception',
        description: 'A skilled thief is given a chance at redemption if he can accomplish the impossible task of inception.',
        genres: ['Action', 'SciFi', 'Drama'],
        releaseDate: new Date('2010-07-16'),
        director: 'Christopher Nolan',
        actors: ['Leonardo DiCaprio', 'Marion Cotillard', 'Tom Hardy'],
      },
      {
        title: 'The Dark Knight',
        description: 'Batman faces the Joker, a criminal mastermind who seeks to undermine Batman\'s influence.',
        genres: ['Action', 'Drama'],
        releaseDate: new Date('2008-07-18'),
        director: 'Christopher Nolan',
        actors: ['Christian Bale', 'Heath Ledger', 'Aaron Eckhart'],
      },
      {
        title: 'Pulp Fiction',
        description: 'The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine.',
        genres: ['Drama', 'Action'],
        releaseDate: new Date('1994-10-14'),
        director: 'Quentin Tarantino',
        actors: ['John Travolta', 'Samuel L. Jackson', 'Uma Thurman'],
      },
      {
        title: 'The Shawshank Redemption',
        description: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption.',
        genres: ['Drama'],
        releaseDate: new Date('1994-09-23'),
        director: 'Frank Darabont',
        actors: ['Tim Robbins', 'Morgan Freeman', 'Bob Gunton'],
      },
      {
        title: 'Forrest Gump',
        description: 'The presidencies of Kennedy and Johnson, the Vietnam War, and other historical events unfold.',
        genres: ['Drama', 'Romance'],
        releaseDate: new Date('1994-07-06'),
        director: 'Robert Zemeckis',
        actors: ['Tom Hanks', 'Robin Wright', 'Gary Sinise'],
      },
      {
        title: 'The Lord of the Rings: The Fellowship of the Ring',
        description: 'A meek Hobbit and eight companions set off on a journey to destroy the powerful One Ring.',
        genres: ['Fantasy', 'Drama'],
        releaseDate: new Date('2001-12-19'),
        director: 'Peter Jackson',
        actors: ['Elijah Wood', 'Ian McKellen', 'Orlando Bloom'],
      },
      {
        title: 'Interstellar',
        description: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.',
        genres: ['SciFi', 'Drama'],
        releaseDate: new Date('2014-11-07'),
        director: 'Christopher Nolan',
        actors: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain'],
      },
      {
        title: 'The Avengers',
        description: 'Earth\'s mightiest heroes must come together and learn to fight as a team.',
        genres: ['Action', 'SciFi'],
        releaseDate: new Date('2012-05-04'),
        director: 'Joss Whedon',
        actors: ['Robert Downey Jr.', 'Chris Evans', 'Mark Ruffalo'],
      },
      {
        title: 'Parasite',
        description: 'A poor family schemes to become employed by a wealthy family by infiltrating their household.',
        genres: ['Drama', 'Comedy'],
        releaseDate: new Date('2019-05-30'),
        director: 'Bong Joon-ho',
        actors: ['Song Kang-ho', 'Lee Sun-kyun', 'Cho Yeo-jeong'],
      },
    ]);
    console.log(`✅ Created ${movies.length} movies`);

    // Create TV Shows
    console.log('📺 Creating TV shows...');
    const tvShows = await TVShow.insertMany([
      {
        title: 'Breaking Bad',
        description: 'A high school chemistry teacher turned methamphetamine manufacturer.',
        genres: ['Drama', 'Action'],
        episodes: [
          {
            episodeNumber: 1,
            seasonNumber: 1,
            releaseDate: new Date('2008-01-20'),
            director: 'Vince Gilligan',
            actors: ['Bryan Cranston', 'Aaron Paul', 'Anna Gunn'],
          },
          {
            episodeNumber: 2,
            seasonNumber: 1,
            releaseDate: new Date('2008-01-27'),
            director: 'Vince Gilligan',
            actors: ['Bryan Cranston', 'Aaron Paul', 'Anna Gunn'],
          },
        ],
      },
      {
        title: 'Game of Thrones',
        description: 'Nine noble families fight for control over the lands of Westeros.',
        genres: ['Fantasy', 'Drama'],
        episodes: [
          {
            episodeNumber: 1,
            seasonNumber: 1,
            releaseDate: new Date('2011-04-17'),
            director: 'Tim Van Patten',
            actors: ['Sean Bean', 'Peter Dinklage', 'Emilia Clarke'],
          },
          {
            episodeNumber: 2,
            seasonNumber: 1,
            releaseDate: new Date('2011-04-24'),
            director: 'Tim Van Patten',
            actors: ['Sean Bean', 'Peter Dinklage', 'Emilia Clarke'],
          },
        ],
      },
      {
        title: 'Stranger Things',
        description: 'When a young boy vanishes, a small town uncovers a mystery involving secret experiments.',
        genres: ['SciFi', 'Horror', 'Drama'],
        episodes: [
          {
            episodeNumber: 1,
            seasonNumber: 1,
            releaseDate: new Date('2016-07-15'),
            director: 'The Duffer Brothers',
            actors: ['Millie Bobby Brown', 'Finn Wolfhard', 'David Harbour'],
          },
        ],
      },
      {
        title: 'The Office',
        description: 'A mockumentary on a group of typical office workers.',
        genres: ['Comedy'],
        episodes: [
          {
            episodeNumber: 1,
            seasonNumber: 1,
            releaseDate: new Date('2005-03-24'),
            director: 'Ken Kwapis',
            actors: ['Steve Carell', 'John Krasinski', 'Jenna Fischer'],
          },
        ],
      },
      {
        title: 'The Crown',
        description: 'Follows the political rivalries and romance of Queen Elizabeth II\'s reign.',
        genres: ['Drama'],
        episodes: [
          {
            episodeNumber: 1,
            seasonNumber: 1,
            releaseDate: new Date('2016-11-04'),
            director: 'Stephen Daldry',
            actors: ['Claire Foy', 'Matt Smith', 'Vanessa Kirby'],
          },
        ],
      },
      {
        title: 'Friends',
        description: 'Follows the personal and professional lives of six twenty to thirty-something-year-old friends.',
        genres: ['Comedy', 'Romance'],
        episodes: [
          {
            episodeNumber: 1,
            seasonNumber: 1,
            releaseDate: new Date('1994-09-22'),
            director: 'James Burrows',
            actors: ['Jennifer Aniston', 'Courteney Cox', 'Lisa Kudrow'],
          },
        ],
      },
      {
        title: 'The Mandalorian',
        description: 'The travels of a lone bounty hunter in the outer reaches of the galaxy.',
        genres: ['SciFi', 'Action'],
        episodes: [
          {
            episodeNumber: 1,
            seasonNumber: 1,
            releaseDate: new Date('2019-11-12'),
            director: 'Dave Filoni',
            actors: ['Pedro Pascal', 'Gina Carano', 'Carl Weathers'],
          },
        ],
      },
      {
        title: 'The Witcher',
        description: 'Geralt of Rivia, a mutated monster-hunter for hire, journeys toward his destiny.',
        genres: ['Fantasy', 'Action', 'Drama'],
        episodes: [
          {
            episodeNumber: 1,
            seasonNumber: 1,
            releaseDate: new Date('2019-12-20'),
            director: 'Alik Sakharov',
            actors: ['Henry Cavill', 'Anya Chalotra', 'Freya Allan'],
          },
        ],
      },
    ]);
    console.log(`✅ Created ${tvShows.length} TV shows`);

    // Create My List entries
    console.log('📋 Creating My List entries...');
    const myListEntries = await MyList.insertMany([
      {
        userId: users[0]._id.toString(),
        contentId: movies[0]._id.toString(),
        contentType: 'movie',
        addedAt: new Date('2024-01-10'),
      },
      {
        userId: users[0]._id.toString(),
        contentId: movies[1]._id.toString(),
        contentType: 'movie',
        addedAt: new Date('2024-01-15'),
      },
      {
        userId: users[0]._id.toString(),
        contentId: tvShows[0]._id.toString(),
        contentType: 'tvshow',
        addedAt: new Date('2024-01-20'),
      },
      {
        userId: users[1]._id.toString(),
        contentId: movies[5]._id.toString(),
        contentType: 'movie',
        addedAt: new Date('2024-02-01'),
      },
      {
        userId: users[1]._id.toString(),
        contentId: tvShows[3]._id.toString(),
        contentType: 'tvshow',
        addedAt: new Date('2024-02-05'),
      },
      {
        userId: users[1]._id.toString(),
        contentId: tvShows[5]._id.toString(),
        contentType: 'tvshow',
        addedAt: new Date('2024-02-10'),
      },
      {
        userId: users[2]._id.toString(),
        contentId: movies[6]._id.toString(),
        contentType: 'movie',
        addedAt: new Date('2024-03-01'),
      },
      {
        userId: users[2]._id.toString(),
        contentId: tvShows[1]._id.toString(),
        contentType: 'tvshow',
        addedAt: new Date('2024-03-05'),
      },
    ]);
    console.log(`✅ Created ${myListEntries.length} My List entries`);

    console.log('\n✨ Seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Movies: ${movies.length}`);
    console.log(`   - TV Shows: ${tvShows.length}`);
    console.log(`   - My List Entries: ${myListEntries.length}`);
    console.log('\n💡 Test User IDs:');
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.username}: ${user._id}`);
    });

    await disconnectDatabase();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    await disconnectDatabase();
    process.exit(1);
  }
};

seedData();

