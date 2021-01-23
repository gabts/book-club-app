import { BrowserRouter, Route, Switch } from "react-router-dom";
import { BookRoute } from "./BookRoute";
import { IndexRoute } from "./IndexRoute";
import { Navigation } from "./Navigation";
import { QuestionRoute } from "./QuestionRoute";
import "./App.css";

export function App() {
  return (
    <BrowserRouter>
      <Navigation />
      <Switch>
        <Route path="/book" component={BookRoute} />
        <Route path="/question" component={QuestionRoute} />
        <Route path="/" component={IndexRoute} />
      </Switch>
    </BrowserRouter>
  );
}
