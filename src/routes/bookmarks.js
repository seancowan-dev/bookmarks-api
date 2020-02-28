const express = require('express');
const logger = require('../logging/logger');
const store = require('../test_data/store');

const bookmarkRouter = express.Router();
const bodyParser = express.json();

bookmarkRouter
.route('/bookmarks')
.get((req, res) => {
    res.json(store);
})
.post(bodyParser, (req, res) => {
    const { id, title, url, rating, description } = req.body;

    // Check if a complete bookmark JSON object has been provided
      if (!id) {
        logger.error(`Id is required`);
        return res
          .status(400)
          .send('Invalid id');
      }
      if (!title) {
        logger.error(`Title is required`);
        return res
          .status(400)
          .send('Invalid title');
      }
      if (!url) {
        logger.error(`Url is required`);
        return res
          .status(400)
          .send('Invalid url');
      }
      if (!rating) {
        logger.error(`Rating is required`);
        return res
          .status(400)
          .send('Invalid rating');
      }
      if (!description) {
        logger.error(`Desc is required`);
        return res
          .status(400)
          .send('Invalid description');
      }

      // All params present, push object to store
      store.push(req.body);

      logger.info(`The bookmark titled ${title} was created successfully.`);

      res
      .status(201);
});

bookmarkRouter
.route('/bookmarks/:id')
.get((req, res) => {
    const { id } = req.params;

    if (!id) {
        res.status(401)
        .send("Please provide an ID when using this endpoint");
    }
    let found = store.filter(item => {
        return item.id === parseInt(id);
    })

    if (!found.length > 0) {
        res.status(400)
        .send("Could not find that ID please try again");
    }

    res.json(found);
})
.delete((req, res) => {
    const { id } = req.params;

    const index = store.findIndex(item => {
        item.id == id;
    })

    if (index.length === -1) {
        res.status(400)
        .send("Could not find that ID please try again");
    }

    store.splice(index, 1);

    logger.info(`Bookmark with id ${id} successfully deleted.`);
    res
      .status(204)
      .end();
})

module.exports = bookmarkRouter;