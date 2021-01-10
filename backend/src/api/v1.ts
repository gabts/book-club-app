import Router from "@koa/router";
import * as db from "../database";
import type * as types from "../types";

export const router = new Router();

router.get("/api/v1/questions", async (ctx) => {
  try {
    const questions = await db.getQuestions();
    ctx.status = 200;
    ctx.body = questions;
  } catch (error) {
    console.error(error);
    ctx.status = 500;
  }
});

router.post("/api/v1/questions", async (ctx) => {
  const body: types.QuestionInput = ctx.request.body;

  if (!body.text) {
    ctx.status = 400;
    return;
  }

  try {
    const question = await db.addQuestion(body.text);
    ctx.status = 201;
    ctx.body = question;
  } catch (error) {
    console.error(error);
    ctx.status = 500;
  }
});
