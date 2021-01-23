import { FormEvent, useEffect, useState } from "react";
import type { apiTypes } from "../types";
import "./IndexRoute.css";

export function BookRoute() {
  const [books, setBooks] = useState<apiTypes.Book[]>([]);

  useEffect(() => {
    (async () => {
      const response = await fetch("/api/v1/books");
      const json = await response.json();
      setBooks(json);
    })();
  }, []);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const authorEl = document.getElementById(
      "input-book-author"
    ) as HTMLInputElement;
    const titleEl = document.getElementById(
      "input-book-title"
    ) as HTMLInputElement;
    const yearEl = document.getElementById(
      "input-book-year"
    ) as HTMLInputElement;

    const author = authorEl.value;
    const title = titleEl.value;
    const year = Number(yearEl.value);

    const response = await fetch("/api/v1/books", {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ author, title, year }),
    });

    if (response.status === 201) {
      const addedBook: apiTypes.Book = await response.json();
      authorEl.value = "";
      titleEl.value = "";
      yearEl.value = "";
      setBooks([...books, addedBook]);
    }
  }

  return (
    <main>
      <h2>Registrera bok</h2>
      <form className="form" onSubmit={submit}>
        <input
          type="text"
          id="input-book-title"
          className="input"
          placeholder="Titel"
        />
        <input
          type="text"
          id="input-book-author"
          className="input"
          placeholder="Författare"
        />
        <input
          type="number"
          id="input-book-year"
          className="input"
          placeholder="Publikationsår"
        />
        <input type="submit" />
      </form>
    </main>
  );
}
