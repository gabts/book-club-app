import { Pool } from "pg";
import type * as types from "./types";

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production",
});

export async function addBook(input: types.BookInput) {
  const client = await pool.connect();

  const countResult = await client.query<{ count: string }>(
    "SELECT count( * ) FROM books;"
  );

  if (Number(countResult.rows[0].count) >= 50) {
    throw "Reached books table rows limit.";
  }

  const insertionResult = await client.query<types.Question>(
    `
      INSERT INTO books ( author, title, year )
      VALUES ( $1, $2, $3 )
      RETURNING *;
    `,
    [input.author, input.title, input.year]
  );

  client.release();
  return insertionResult.rows[0];
}

export async function getBooks() {
  const client = await pool.connect();
  const result = await client.query<types.Book[]>("SELECT * FROM books;");
  client.release();
  return result.rows;
}

export async function addQuestion(input: types.QuestionInput) {
  const client = await pool.connect();

  const countResult = await client.query<{ count: string }>(
    "SELECT count( * ) FROM questions;"
  );

  if (Number(countResult.rows[0].count) >= 100) {
    throw "Reached questions table rows limit.";
  }

  const insertionResult = await client.query<types.Question>(
    "INSERT INTO questions ( book, text ) VALUES ( $1, $2 ) RETURNING *;",
    [input.book, input.text]
  );

  client.release();
  return insertionResult.rows[0];
}

export async function getQuestions(book: null | number) {
  const client = await pool.connect();
  const result = await client.query<types.Question[]>(
    "SELECT * FROM questions WHERE book = $1 OR book IS NULL;",
    [book]
  );
  client.release();
  return result.rows;
}
