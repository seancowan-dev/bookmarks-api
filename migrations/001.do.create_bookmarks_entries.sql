CREATE TABLE bookmarks_entries (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    title TEXT NOT NULL,
    description TEXT,
    url TEXT NOT NULL,
    rating INTEGER NOT NULL
);