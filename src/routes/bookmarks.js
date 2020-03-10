const express = require('express');
const logger = require('../logging/logger');
const xss = require('xss');
const BookmarksService = require('../bookmarks-service');

const bookmarkRouter = express.Router();
const bodyParser = express.json();

const serializeBookmark = bookmark => ({
  id: bookmark.id,
  rating: xss(bookmark.rating),
  title: xss(bookmark.title),
  description: xss(bookmark.description),
  url: xss(bookmark.url),
})

bookmarkRouter
.route('/bookmarks')
.get((req, res) => {
    const knexInstance = req.app.get('db');
    BookmarksService.getAllBookmarks(knexInstance)
    .then(bookmarks => {
      const sanitizedBookmarks = [];
      bookmarks.forEach(bookmark => {
        sanitizedBookmarks.push(serializeBookmark(bookmark));
      })
        res.json(sanitizedBookmarks);
    });
})
.post(bodyParser, (req, res) => {
    const knexInstance = req.app.get('db');
    const { title, url, rating, description } = req.body;
    const newBookmark = { title, url, rating, description };

    // Check if a complete bookmark JSON object has been provided
      if (!title) {
        logger.error(`Title is required`);
        return res
          .status(400)
          .send({error: {
            message: `Missing 'title' in request body`
        }});
      }
      if (!url) {
        logger.error(`Url is required`);
        return res
          .status(400)
          .send({error: {
            message: `Missing 'url' in request body`
        }});
      }
      if (!rating) {
        logger.error(`Rating is required`);
        return res
          .status(400)
          .send({error: {
            message: `Missing 'rating' in request body`
        }});
      }
      if (parseInt(rating) > 5 || parseInt(rating) <= 0) {
        logger.error(`Rating must be between 1 and 5`);
        return res
          .status(400)
          .send({error: {
            message: `Rating must be between 1 and 5 only`
        }});
      }
      if (!description) {
        logger.error(`Description is required`);
        return res
          .status(400)
          .send({error: {
            message: `Missing 'description' in request body`
        }});
      }

      // All params present, enter object in DB
      BookmarksService.insertBookmark(knexInstance, newBookmark)
      .then(bookmark => {
        res
        .status(201)
        .location(`/bookmarks/${bookmark.id}`)
        .json(serializeBookmark(bookmark))
      })

      logger.info(`The bookmark titled ${title} was created successfully.`);
});

bookmarkRouter
.route('/bookmarks/:id')
.get((req, res, next) => {
  const knexInstance = req.app.get('db');
  const { id } = req.params;
    BookmarksService.getBookmarkById(knexInstance, id)
    .then(bookmark => {
      if (!bookmark) {
        return res.status(404).json({
          error: { message: 'Could not find bookmark with that ID.' }
        })
      }
      if (!id) {
        res.status(401)
        .send("Please provide an ID when using this endpoint");
      }

      if (bookmark.id === parseInt(id)) {
        res.json(serializeBookmark(bookmark));
      }
    })
    .catch(next);

})
.delete((req, res, next) => {
    const { id } = req.params;
    const knexInstance = req.app.get('db');

    BookmarksService.getBookmarkById(knexInstance, id)
    .then(bookmark => {
      if (!bookmark) {
        return res.status(404).json({
          error: { message: 'Could not find bookmark with that ID.' }
        });
      } else {
        BookmarksService.deleteBookmark(knexInstance, id)
        .then(affected => {
          res.status(204).end()
        })
        .catch(next)
      }
    });

  }
);

module.exports = bookmarkRouter;