import { FormEvent, useEffect, useState } from "react";
import type { apiTypes } from "../types";
import "./App.css";

function getInputElement(id: string) {
  return document.getElementById(id) as HTMLInputElement;
}

export function App() {
  const [questions, setQuestions] = useState<apiTypes.Question[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [books, setBooks] = useState<apiTypes.Book[]>([]);

  async function fetchQuestions(book: null | number) {
    const response = await fetch(`/api/v1/questions?book=${book}`);
    const json = await response.json();
    setQuestionIndex(0);
    setQuestions(json.sort(() => Math.random() - 0.5));
  }

  useEffect(() => {
    (async () => {
      const response = await fetch("/api/v1/books");
      const json = await response.json();
      setBooks(json);
      const firstBookId = json.length ? json[0].id : null;
      fetchQuestions(firstBookId);
    })();
  }, []);

  function onChangeBook() {
    const el = getInputElement("select-book");
    const book = Number(el.value);
    fetchQuestions(book);
  }

  function nextQuestion() {
    if (questionIndex < questions.length - 1) {
      setQuestionIndex(questionIndex + 1);
    }
  }

  function previousQuestion() {
    if (questionIndex > 0) {
      setQuestionIndex(questionIndex - 1);
    }
  }

  async function submitBookForm(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const authorEl = getInputElement("input-book-author");
    const titleEl = getInputElement("input-book-title");
    const yearEl = getInputElement("input-book-year");

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

  async function submitQuestionForm(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const bookEl = getInputElement("input-question-book");
    const textEl = getInputElement("input-question-text");

    const book = bookEl.value === "null" ? null : Number(bookEl.value);
    const text = textEl.value;

    const response = await fetch("/api/v1/questions", {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ book, text }),
    });

    if (response.status === 201) {
      const selectedBookEl = getInputElement("select-book");
      const selectedBook = Number(selectedBookEl.value);
      const addedQuestion: apiTypes.Question = await response.json();
      textEl.value = "";

      if (addedQuestion.book === null || addedQuestion.book === selectedBook) {
        setQuestions([...questions, addedQuestion]);
      }
    }
  }

  return (
    <main className="app">
      <h1>Bokcirkelfrågor</h1>
      <select className="input" id="select-book" onChange={onChangeBook}>
        {books.map((book) => (
          <option key={book.id} value={book.id}>
            {book.title}
          </option>
        ))}
      </select>
      <p>
        {questions.length ? questions[questionIndex].text : "Inga frågor ännu."}
      </p>
      <button disabled={!questionIndex} onClick={previousQuestion}>
        Föregående fråga
      </button>
      <button
        disabled={!questions.length || questionIndex === questions.length - 1}
        onClick={nextQuestion}
      >
        Nästa fråga
      </button>
      <h2>Ställ en ny fråga</h2>
      <form className="form" onSubmit={submitQuestionForm}>
        <textarea
          id="input-question-text"
          className="input"
          rows={4}
        ></textarea>
        <select className="input" id="input-question-book">
          <option key="null" value="null">
            Ingen bok
          </option>
          {books.map((book) => (
            <option key={book.id} value={book.id}>
              {book.title}
            </option>
          ))}
        </select>
        <input className="submit" type="submit" />
      </form>
      <h2>Registrera bok</h2>
      <form className="form" onSubmit={submitBookForm}>
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
        <input className="submit" type="submit" />
      </form>
    </main>
  );
}
