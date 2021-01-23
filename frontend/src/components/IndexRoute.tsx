import { useEffect, useState } from "react";
import type { apiTypes } from "../types";
import "./IndexRoute.css";

export function IndexRoute() {
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
    const el = document.getElementById("select-book") as HTMLInputElement;
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

  return (
    <main>
      <select id="select-book" onChange={onChangeBook}>
        {books.map((book) => (
          <option key={book.id} value={book.id}>
            {book.title}
          </option>
        ))}
      </select>
      <p className="active-question">
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
    </main>
  );
}
