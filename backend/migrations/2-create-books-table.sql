-- up-migration
CREATE TABLE books (
  id SERIAL PRIMARY KEY,
  title TEXT UNIQUE NOT NULL,
  author TEXT NOT NULL,
  year INTEGER NOT NULL
);

ALTER TABLE questions ADD COLUMN book INTEGER references books(id);

-- down-migration
ALTER TABLE questions DROP COLUMN book;

DROP TABLE books;
