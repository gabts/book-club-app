import { Pool } from "pg";
import type * as types from "./types";

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function addQuestion(text: string) {
  const client = await pool.connect();

  const countResult = await client.query<{ count: string }>(
    "SELECT count( * ) FROM questions;"
  );

  if (Number(countResult.rows[0].count) >= 100) {
    throw "Reached questions table rows limit.";
  }

  const insertionResult = await client.query<types.Question>(
    "INSERT INTO questions ( text ) VALUES ( $1 ) RETURNING id, text;",
    [text]
  );

  client.release();
  return insertionResult.rows[0];
}

export async function getQuestions() {
  const client = await pool.connect();
  const result = await client.query<types.Question>("SELECT * FROM questions;");
  client.release();
  return result.rows;
}
