import assert from "assert";
import request from "supertest";
import { migratorosaurus } from "migratorosaurus";
import { app } from "../app";
import { pool } from "../database";
import type * as types from "../types";

describe("api v1", () => {
  before(async () => {
    await migratorosaurus(pool, { target: "1-create-questions-table.sql" });
    await migratorosaurus(pool);
  });

  afterEach(async () => {
    const client = await pool.connect();
    await client.query("DELETE FROM questions;");
    client.release();
  });

  it("add question validates input", async () => {
    await request(app.callback()).post("/api/v1/questions").expect(400);

    await request(app.callback())
      .post("/api/v1/questions")
      .send({})
      .expect(400);
  });

  it("adds question", async () => {
    const question = { text: "Sample question" };

    const response = await request(app.callback())
      .post("/api/v1/questions")
      .send(question)
      .expect(201);

    assert.strictEqual(typeof response.body.id, "number");
    assert.strictEqual(response.body.text, question.text);
  });

  it("is limited to 100 questions", async () => {
    const question = { text: "Sample question" };

    // Insert 100 rows into questions table
    const client = await pool.connect();
    await client.query(`
      INSERT INTO questions ( text )
      SELECT g.text
      FROM generate_series(1, 100) AS g ( text ) ;
    `);
    client.release();

    await request(app.callback())
      .post("/api/v1/questions")
      .send(question)
      .expect(500);
  });

  it("gets questions", async () => {
    const questions: types.QuestionInput[] = [
      { text: "First sample question" },
      { text: "Second sample question" },
      { text: "Third sample question" },
    ];

    for (const question of questions) {
      await request(app.callback()).post("/api/v1/questions").send(question);
    }

    const response = await request(app.callback())
      .get("/api/v1/questions")
      .expect(200);

    assert.ok(Array.isArray(response.body));
    assert.strictEqual(response.body.length, 3);

    for (let i = 0; i < questions.length; i++) {
      const body: types.Question = response.body[i];

      assert.strictEqual(typeof body.id, "number");
      assert.strictEqual(body.text, questions[i].text);
    }
  });
});
