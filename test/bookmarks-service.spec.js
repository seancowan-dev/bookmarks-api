const { expect } = require('chai');
const knex = require('knex');
const dotenv = require('dotenv');
dotenv.config();
const bookmarksRouter = require('../src/routes/bookmarks');
const app = require('../src/app');
const BookmarksService = require('../src/bookmarks-service');
const { makeBookmarksArray, makeMaliciousBookmark } = require('../test/bookmarks.fixtures');

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
            const bookmarkId = 50;
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
            const bkId = 96;
            const expected = testBookmarks.find(item => { return item.id === bkId });
            return supertest(app)
            .get(`/bookmarks/${bkId}`)
            .set('Authorization', 'Bearer ' + process.env.API_TOKEN)
            .expect(200, expected);
        });
    });

    describe('| POST Test Object |', () => {
        it('POST /bookmarks | Creates article responding with 201 and new entry', function() {
            this.retries(3)
            const newBookmark = {
                title: 'Heroku',
                url: 'https://www.heroku.com',
                rating: 5,
                description: 'Cloud hosting platform for server side code!'
            }
            return supertest(app)
                .post('/bookmarks')
                .set('Authorization', 'Bearer ' + process.env.API_TOKEN)
                .send(newBookmark)
                .expect(201)
                .expect(res => {
                    expect(res.body.title).to.eql(newBookmark.title);
                    expect(res.body.url).to.eql(newBookmark.url);
                    expect(parseInt(res.body.rating)).to.eql(parseInt(newBookmark.rating));
                    expect(res.body.description).to.eql(newBookmark.description);
                    expect(res.body).to.have.property('id');
                    expect(res.headers.location).to.eql(`/bookmarks/${res.body.id}`)
                })
                .then(res => {
                    supertest(app)
                    .get(`/bookmarks/${res.body.id}`)
                    .expect(res.body)
                });
        });

        const required = ['title', 'url', 'rating', 'description']

        const badRange = {
            title: 'Heroku',
            url: 'https://www.heroku.com',
            rating: "-1",
            description: 'Cloud hosting platform for server side code!'
        }

        required.forEach(field => {

            const newBookmark = {
                title: 'Heroku',
                url: 'https://www.heroku.com',
                rating: "5",
                description: 'Cloud hosting platform for server side code!'
            }

            it(`POST /bookmarks | Responds with 400 and an error msg when required fields are missing`, () => {
                delete newBookmark[field]

                return supertest(app)
                .post('/bookmarks')
                .set('Authorization', 'Bearer ' + process.env.API_TOKEN)
                .send(newBookmark)
                .expect(400, {
                    error: {
                        message: `Missing '${field}' in request body`
                    }
                });
            });

            it(`POST /bookmarks | Removes JS content from potential XSS attacks`, () => {
                const { maliciousBookmark, expectedBookmark } = makeMaliciousBookmark();
                return supertest(app)
                .post(`/bookmarks`)
                .set('Authorization', 'Bearer ' + process.env.API_TOKEN)
                .send(maliciousBookmark)
                .expect(201)
                .expect(res => {
                    expect(res.body.title).to.eql(expectedBookmark.title);
                    expect(res.body.url).to.equal(expectedBookmark.url);
                    expect(res.body.description).to.eql(expectedBookmark.description);
                    expect(res.body.rating).to.equal(expectedBookmark.rating);
                });
            });
        });

        it(`POST /bookmarks | Responds with 400 an error when rating is not in valid range`, () => {
            return supertest(app)
            .post('/bookmarks')
            .set('Authorization', 'Bearer ' + process.env.API_TOKEN)
            .send(badRange)
            .expect(400, {
                error: {
                    message: `Rating must be between 1 and 5 only`
                }
            });
        });
    });

    describe(`| DELETE Test Object |`, () => {
        context(`Given no bookmarks`, () => {
          it(`DELETE /bookmarks:id | Responds with 404`, () => {
            const id = 1234
            return supertest(app)
              .delete(`/bookmarks/${id}`)
              .set('Authorization', 'Bearer ' + process.env.API_TOKEN)
              .expect(404, { error: { message: `Could not find bookmark with that ID.` } })
          })
        })
    
        context('Given there are bookmarks in the database', () => {
          const testBookmarks = makeBookmarksArray();
    
          beforeEach('insert bookmarks', () => {
            return db
              .into('bookmarks_entries')
              .insert(testBookmarks)
          })
    
          it('responds with 204 and removes the bookmark', () => {
            const idToRemove = 96
            return supertest(app)
              .delete(`/bookmarks/${idToRemove}`)
              .set('Authorization', 'Bearer ' + process.env.API_TOKEN)
              .expect(204)
          })
        })
      });

    describe(`| PATCH Test Object |`,  () => {
        context(`Given no bookmarks`, () => {
            it(`| PATCH /bookmarks/:id | Responds with 404`, () => {
                const bookmarkId = 23231;
                return supertest(app)
                    .patch(`/bookmarks/${bookmarkId}`)
                    .set('Authorization', 'Bearer ' + process.env.API_TOKEN)
                    .expect(404, { error: {message: `Could not find bookmark with that ID.`} })
            })
        })

        context('Given bookmarks exist', () => {
            const testBookmarks = makeBookmarksArray();

            beforeEach('insert bookmarks', () => {
                return db
                .into('bookmarks_entries')
                .insert(testBookmarks)
            });

            it('| PATCH /bookmarks/:id | Responds with 204 and updates the bookmark', () => {
                const idToUpdate = 95
                const updateBookmark = {
                    title: 'updated bookmark title',
                    description: 'updated bookmark description',
                    rating: "3",
                    url: 'updated url'
                }
                const expected = {
                    ...testBookmarks[idToUpdate],
                    ...updateBookmark
                }

                return supertest(app)
                    .patch(`/bookmarks/${idToUpdate}`)
                    .set('Authorization', 'Bearer ' + process.env.API_TOKEN)
                    .send(updateBookmark)
                    .expect(204)
                    .then(res => {
                        supertest(app)
                            .get(`/bookmarks/${idToUpdate}`)
                            .expect(expected)
                    })
            });

            it('| PATCH /bookmarks/:id | Responds with 400 when no required fields supplied', () => {
                const idToUpdate = 96;
                return supertest(app)
                    .patch(`/bookmarks/${idToUpdate}`)
                    .set('Authorization', 'Bearer ' + process.env.API_TOKEN)
                    .send({ irrelevantField: 'foo'})
                    .expect(400, {
                        error: {
                            message: `Request body must content either 'title', 'url', 'description' or 'rating'`
                        }
                    })
            });
        })
    });
});

