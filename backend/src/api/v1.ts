import Router from "@koa/router";
import * as db from "../database";
import type * as types from "../types";

export const router = new Router();

router.get("/api/v1/books", async (ctx) => {
  try {
    const books = await db.getBooks();
    ctx.status = 200;
    ctx.body = books;
  } catch (error) {
    console.error(error);
    ctx.status = 500;
  }
});

router.post("/api/v1/books", async (ctx) => {
  const body: types.BookInput = ctx.request.body;

  if (
    !(typeof body.author === "string" && body.author.length) ||
    !(typeof body.title === "string" && body.title.length) ||
    typeof body.year !== "number"
  ) {
    ctx.status = 400;
    ctx.body = "Invalid body";
    return;
  }

  try {
    const book = await db.addBook(body);
    ctx.status = 201;
    ctx.body = book;
  } catch (error) {
    console.error(error);
    ctx.status = 500;
  }
});

router.get("/api/v1/questions", async (ctx) => {
  const query: { book: string } = ctx.query;

  if (typeof query.book !== "string") {
    ctx.status = 400;
    ctx.body = "Invalid body";
    return;
  }

  let book = query.book === "null" ? null : parseInt(query.book, 10);

  if (!(book === null || !Number.isNaN(book))) {
    ctx.status = 400;
    ctx.body = "Invalid body";
    return;
  }

  try {
    const questions = await db.getQuestions(book);
    ctx.status = 200;
    ctx.body = questions;
  } catch (error) {
    console.error(error);
    ctx.status = 500;
  }
});

router.post("/api/v1/questions", async (ctx) => {
  const body: types.QuestionInput = ctx.request.body;

  if (
    (body.book !== null && typeof body.book !== "number") ||
    typeof body.text !== "string" ||
    !body.text.length
  ) {
    ctx.status = 400;
    ctx.body = "Invalid body";
    return;
  }

  try {
    const question = await db.addQuestion(body);
    ctx.status = 201;
    ctx.body = question;
  } catch (error) {
    console.error(error);
    ctx.status = 500;
  }
});
