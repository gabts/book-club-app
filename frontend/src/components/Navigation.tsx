import { Link } from "react-router-dom";
import "./Navigation.css";

export function Navigation() {
  return (
    <nav className="nav">
      <ul className="nav__list">
        <li>
          <Link className="nav__link" to="/">
            <h1 className="nav__h1">Bokcirkel</h1>
          </Link>
        </li>
        <li>
          <Link className="nav__link" to="/question">
            Lägg till fråga
          </Link>
        </li>
      </ul>
    </nav>
  );
}
