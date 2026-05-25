/// <reference types="vite-plugin-svgr/client" />

import "./App.scss";
import "./i18n/i18n";

import { BrowserRouter as Router } from "react-router-dom";

import AppRouter from "./app/router/AppRouter";
import { ErrorBoundary } from "./covaltech-react-ui";

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AppRouter />
      </Router>
    </ErrorBoundary>
  );
}

export default App;
