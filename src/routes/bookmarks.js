const express = require('express');
const logger = require('../logging/logger');
const BookmarksService = require('../bookmarks-service');

const bookmarkRouter = express.Router();
const bodyParser = express.json();

bookmarkRouter
.route('/bookmarks')
.get((req, res) => {
    const knexInstance = req.app.get('db');
    BookmarksService.getAllBookmarks(knexInstance)
    .then(bookmarks => {
        res.json(bookmarks);
    });
})

// Disable until next checkpoint
// .post(bodyParser, (req, res) => {
//     const { id, title, url, rating, description } = req.body;

//     // Check if a complete bookmark JSON object has been provided
//       if (!id) {
//         logger.error(`Id is required`);
//         return res
//           .status(400)
//           .send('Invalid id');
//       }
//       if (!title) {
//         logger.error(`Title is required`);
//         return res
//           .status(400)
//           .send('Invalid title');
//       }
//       if (!url) {
//         logger.error(`Url is required`);
//         return res
//           .status(400)
//           .send('Invalid url');
//       }
//       if (!rating) {
//         logger.error(`Rating is required`);
//         return res
//           .status(400)
//           .send('Invalid rating');
//       }
//       if (!description) {
//         logger.error(`Desc is required`);
//         return res
//           .status(400)
//           .send('Invalid description');
//       }

//       // All params present, push object to store
//       store.push(req.body);

//       logger.info(`The bookmark titled ${title} was created successfully.`);

//       res
//       .status(201);
// });

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
        res.json(bookmark);
      }
    })
    .catch(next);

});

// Disabled until next checkpoint
// .delete((req, res) => {
//     const { id } = req.params;

//     const index = store.findIndex(item => {
//         item.id == id;
//     })

//     if (index.length === -1) {
//         res.status(400)
//         .send("Could not find that ID please try again");
//     }

//     store.splice(index, 1);

//     logger.info(`Bookmark with id ${id} successfully deleted.`);
//     res
//       .status(204)
//       .end();
// })

module.exports = bookmarkRouter;