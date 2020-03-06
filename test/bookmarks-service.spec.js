const { expect } = require('chai');
const knex = require('knex');
const dotenv = require('dotenv');
dotenv.config();
const bookmarksRouter = require('../src/routes/bookmarks');
const app = require('../src/app');
const BookmarksService = require('../src/bookmarks-service');
const { makeBookmarksArray } = require('../test/bookmarks.fixtures');

describe('Bookmarks Service Object | Endpoints', () =>{
    let db;

    before('setup db', () => {
        db = knex({
          client: 'pg',
          connection: process.env.TEST_DB_URL,
        });
        app.set('db', db);
      });

      
    before('clean db', () => db('bookmarks_entries').truncate());
  
    afterEach('clean db', () => db('bookmarks_entries').truncate());

    after('destroy db connection', () => db.destroy());

    context('|  No Bookmarks In DB  |', () => {
        it('GET /bookmarks | Responds with 200 and empty array', () => {
            return supertest(app)
            .get('/bookmarks')
            .set('Authorization', 'Bearer ' + process.env.API_TOKEN)
            .expect(200, []);
        });
        it('GET /bookmarks/:id | Responds with 404 and error message', () => {
            const bookmarkId = 12;
            return supertest(app)
            .get(`/bookmarks/${bookmarkId}`)
            .set('Authorization', 'Bearer ' + process.env.API_TOKEN)
            .expect(404, { error: { message: `Could not find bookmark with that ID.` } });
        });
    });

    context('|  Bookmark Entries Present in DB  |', () => {
        const testBookmarks = makeBookmarksArray();

        beforeEach('Insert Test Bookmarks', () => {
            return db
            .into('bookmarks_entries')
            .insert(testBookmarks);
        });

        it('GET /bookmarks | Responds with 200 and bookmark entries', () => {
            return supertest(app)
            .get('/bookmarks')
            .set('Authorization', 'Bearer ' + process.env.API_TOKEN)
            .expect(200, testBookmarks);
        });

        it('GET /bookmarks/:id | Responds with 200 and specified bookmark', () => {
            const bkId = 2;
            const expected = testBookmarks[bkId - 1];
            return supertest(app)
            .get(`/bookmarks/${bkId}`)
            .set('Authorization', 'Bearer ' + process.env.API_TOKEN)
            .expect(200, expected);
        });
    });
})

