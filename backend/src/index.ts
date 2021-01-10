import path from "path";
import { migratorosaurus } from "migratorosaurus";
import { app } from "./app";
import { pool } from "./database";

const port = process.env.PORT || 8080;

(async function () {
  await migratorosaurus(pool, {
    directory: path.join(__dirname, "../migrations"),
    log: console.log,
  });

  app.listen(port);

  console.log(`App running on port ${port}! 🎉`);
})();
