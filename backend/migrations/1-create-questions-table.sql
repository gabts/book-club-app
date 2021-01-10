-- up-migration
CREATE TABLE questions (
  id SERIAL PRIMARY KEY,
  text TEXT NOT NULL
);

-- down-migration
DROP TABLE questions;
