import { FormEvent, useEffect, useState } from "react";
import type { apiTypes } from "../types";
import "./App.css";

export function App() {
  const [questions, setQuestions] = useState<apiTypes.Question[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);

  useEffect(() => {
    (async () => {
      const response = await fetch("/api/v1/questions");
      const json = await response.json();
      setQuestions(json.sort(() => Math.random() - 0.5));
      setQuestionIndex(0);
    })();
  }, []);

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

  async function submitForm(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const inputEl = document.getElementById("input") as HTMLInputElement;
    const text = inputEl?.value;

    if (text) {
      const response = await fetch("/api/v1/questions", {
        method: "post",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (response.status === 201) {
        const addedQuestion: apiTypes.Question = await response.json();
        setQuestions([...questions, addedQuestion]);
        inputEl.value = "";
      }
    }
  }

  return (
    <main className="app">
      <h1>Bokcirkelfrågor</h1>
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
      <form className="form" onSubmit={submitForm}>
        <textarea id="input" className="input" rows={4}></textarea>
        <input className="submit" type="submit" />
      </form>
    </main>
  );
}
