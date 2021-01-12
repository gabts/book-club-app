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
    await client.query("DELETE FROM questions; DELETE FROM BOOKS;");
    client.release();
  });

  it("validates input", async () => {
    await request(app.callback()).post("/api/v1/books").expect(400);
    await request(app.callback()).post("/api/v1/books").send({}).expect(400);
    await request(app.callback()).post("/api/v1/questions").expect(400);

    await request(app.callback())
      .post("/api/v1/questions")
      .send({})
      .expect(400);
  });

  it("adds question without book", async () => {
    const question: types.QuestionInput = {
      book: null,
      text: "Sample question",
    };

    const response = await request(app.callback())
      .post("/api/v1/questions")
      .send(question)
      .expect(201);

    assert.strictEqual(typeof response.body.id, "number");
    assert.strictEqual(response.body.book, question.book);
    assert.strictEqual(response.body.text, question.text);
  });

  it("adds book and adds question to book", async () => {
    const book: types.BookInput = {
      author: "George R. R. Martin",
      title: "A Game of Thrones",
      year: 1996,
    };

    const bookResponse = await request(app.callback())
      .post("/api/v1/books")
      .send(book)
      .expect(201);

    assert.strictEqual(typeof bookResponse.body.id, "number");
    assert.strictEqual(bookResponse.body.author, book.author);
    assert.strictEqual(bookResponse.body.title, book.title);
    assert.strictEqual(bookResponse.body.year, book.year);

    const question: types.QuestionInput = {
      book: bookResponse.body.id,
      text: "Why did Eddard have to die? :-(",
    };

    const questionResponse = await request(app.callback())
      .post("/api/v1/questions")
      .send(question)
      .expect(201);

    assert.strictEqual(typeof questionResponse.body.id, "number");
    assert.strictEqual(questionResponse.body.book, question.book);
    assert.strictEqual(questionResponse.body.text, question.text);
  });

  it("is limited to 100 questions and 25 books", async () => {
    const question: types.QuestionInput = {
      book: null,
      text: "Sample question",
    };

    // Insert 100 rows into questions table
    const client = await pool.connect();
    await client.query(`
      INSERT INTO questions ( text )
      SELECT g.text
      FROM generate_series( 1, 100 ) AS g ( text );

      INSERT INTO books ( author, title, year )
      VALUES
        ${(() => {
          // TODO: Figure out how to do generated series with multiple columns
          let str = "";
          for (let i = 1; i <= 25; i++) {
            str += `( 'Author', 'Title ${i}', ${2000 + i} )`;
            if (i < 25) str += ", ";
          }
          return str;
        })()};
    `);
    client.release();

    await request(app.callback())
      .post("/api/v1/questions")
      .send(question)
      .expect(500);
  });

  it("gets books", async () => {
    const books: types.BookInput[] = [
      { author: "George R. R. Martin", title: "A Game of Thrones", year: 1996 },
      { author: "George R. R. Martin", title: "A Clash of Kings", year: 1999 },
      { author: "George R. R. Martin", title: "A Storm of Swords", year: 2000 },
      { author: "George R. R. Martin", title: "A Feast for Crows", year: 2005 },
      {
        author: "George R. R. Martin",
        title: "A Dance with Dragons",
        year: 2011,
      },
    ];

    for (const book of books) {
      await request(app.callback()).post("/api/v1/books").send(book);
    }

    const response = await request(app.callback())
      .get("/api/v1/books")
      .expect(200);

    assert.ok(Array.isArray(response.body));
    assert.strictEqual(response.body.length, books.length);

    for (let i = 0; i < books.length; i++) {
      const body: types.Book = response.body[i];

      assert.strictEqual(typeof body.id, "number");
      assert.strictEqual(body.author, books[i].author);
      assert.strictEqual(body.title, books[i].title);
      assert.strictEqual(body.year, books[i].year);
    }
  });

  it("gets questions", async () => {
    const book: types.BookInput = {
      author: "George R. R. Martin",
      title: "A Game of Thrones",
      year: 1996,
    };

    const bookResponse = await request(app.callback())
      .post("/api/v1/books")
      .send(book);

    const questions: types.QuestionInput[] = [
      { text: "First sample question", book: null },
      { text: "Second sample question", book: bookResponse.body.id },
      { text: "Third sample question", book: null },
    ];

    for (const question of questions) {
      await request(app.callback()).post("/api/v1/questions").send(question);
    }

    const questionsResponse = await request(app.callback())
      .get(`/api/v1/questions?book=${bookResponse.body.id}`)
      .expect(200);

    assert.ok(Array.isArray(questionsResponse.body));
    assert.strictEqual(questionsResponse.body.length, questions.length);

    for (let i = 0; i < questions.length; i++) {
      const body: types.Question = questionsResponse.body[i];

      assert.strictEqual(typeof body.id, "number");
      assert.strictEqual(body.book, questions[i].book);
      assert.strictEqual(body.text, questions[i].text);
    }

    const questionsNullResponse = await request(app.callback())
      .get("/api/v1/questions?book=null")
      .expect(200);

    assert.ok(Array.isArray(questionsNullResponse.body));
    assert.strictEqual(questionsNullResponse.body.length, 2);
  });
});
