const BookmarksService = {
    getAllBookmarks(knex) {
        return knex.select('*').from('bookmarks_entries');
    },
    getBookmarkById(knex, id) {
        return knex.from('bookmarks_entries').select('*').where('id', id).first();
    },
    insertBookmark(knex, newBookmark) {
        return knex
        .insert(newBookmark)
        .into('bookmarks_entries')
        .returning('*')
        .then(rows => {
            return rows[0];
        });
    },
    deleteBookmark(knex, id) {
        return knex('bookmarks_entries')
        .where({ id })
        .delete()
    },
    updateBookmark(knex, id, newBookmarkFields) {
        return knex('bookmarks_entries')
          .where({ id })
          .update(newBookmarkFields)
      },
};

module.exports = BookmarksService;