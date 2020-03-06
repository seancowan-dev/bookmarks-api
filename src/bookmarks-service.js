const BookmarksService = {
    getAllBookmarks(knex) {
        return knex.select('*').from('bookmarks_entries');
    },
    getBookmarkById(knex, id) {
        return knex.from('bookmarks_entries').select('*').where('id', id).first();
    }
};

module.exports = BookmarksService;