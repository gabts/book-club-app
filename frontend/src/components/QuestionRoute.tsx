import { FormEvent, useEffect, useState } from "react";
import type { apiTypes } from "../types";
import "./IndexRoute.css";

export function QuestionRoute() {
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

    const bookEl = document.getElementById(
      "input-question-book"
    ) as HTMLInputElement;
    const textEl = document.getElementById(
      "input-question-text"
    ) as HTMLInputElement;

    const book = bookEl.value === "null" ? null : Number(bookEl.value);
    const text = textEl.value;

    const response = await fetch("/api/v1/questions", {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ book, text }),
    });

    if (response.status === 201) {
      textEl.value = "";
    }
  }

  return (
    <main>
      <h2>Ställ en ny fråga</h2>
      <form className="form" onSubmit={submit}>
        <textarea
          id="input-question-text"
          className="input"
          rows={4}
        ></textarea>
        <label>
          Vilken bok tillhör frågan?
          <select className="input" id="input-question-book">
            <option key="null" value="null">
              Alla böcker
            </option>
            {books.map((book) => (
              <option key={book.id} value={book.id}>
                {book.title}
              </option>
            ))}
          </select>
        </label>
        <input type="submit" />
      </form>
    </main>
  );
}
