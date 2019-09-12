/*
 * This is an example of a server that utilizes the router.
 */

// Importing some console colors
import {
  green,
  cyan,
  bold,
  yellow
} from "colors/colors.ts";

import { Application, Context, Router, Status } from "oak/mod.ts";

let books = [{
  id: "1",
  title: "The Hound of the Baskervilles",
  author: "Conan Doyle, Author"
}]

function notFound(context: Context) {
  context.response.status = Status.NotFound;
  context.response.body = `<html><body><h1>404 - Not Found</h1><p>Path <code>${
    context.request.url
  }</code> not found.`;
}

(async () => {
  const router = new Router();
  router
    .get("/", (context, next) => {
      context.response.body = "Hello world!";
    })
    .post("/book", async (context, next) => {
      const { value: body } = await context.request.body()
      books.push(body)
      context.response.body = 'Libro añadido'
    })
    .put("/book", async (context, next) => {
      const { value: body } = await context.request.body()
      const index = books.findIndex(b => b.id === body.id)
      if (index >= 0) {
        books[index] = body
        context.response.body = 'Libro actualizado'
      } else {
        context.response.status = Status.NotFound;
        context.response.body = `No se encontro el libro con id ${body.id}`;
      }
    })
    .delete<{ id: string }>("/book/:id", (context, next) => {
      if (context.params) {
        const index = books.findIndex(b => b.id === context.params.id);
        if (index >= 0) {
          books.splice(index, 1);
          context.response.body = `Libro eliminado correctamente`;
        } else {
          return notFound(context);
        }
      }
    })
    .get("/book", async (context, next) => {
      context.response.body = books
    })
    .get<{ id: string }>("/book/:id", async (context, next) => {
      if (context.params) {
        context.response.body = books.find(b => b.id === context.params.id);
      } else {
        return notFound(context);
      }
    });

  const app = new Application();

  // Logger
  app.use(async (context, next) => {
    await next();
    const rt = context.response.headers.get("X-Response-Time");
    console.log(
      `${green(context.request.method)} ${cyan(context.request.url)} - ${bold(
        String(rt)
      )}`
    );
  });

  // Response Time
  app.use(async (context, next) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    context.response.headers.set("X-Response-Time", `${ms}ms`);
  });

  // Use the router
  app.use(router.routes());
  app.use(router.allowedMethods());

  // A basic 404 page
  app.use(notFound);

  const address = "127.0.0.1:8000";
  console.log(bold("Start listening on ") + yellow(address));
  await app.listen(address);
  console.log(bold("Finished."));
})();
