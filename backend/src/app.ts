import Koa from "koa";
import koaBodyParser from "koa-bodyparser";
import koaStatic from "koa-static";
import path from "path";
import { router } from "./api/v1";

export const app = new Koa();

app.use(koaBodyParser());
app.use(router.allowedMethods());
app.use(router.routes());
app.use(koaStatic(path.join(__dirname, "../../frontend/build")));
app.use((ctx) => {
  ctx.status = 401;
});
