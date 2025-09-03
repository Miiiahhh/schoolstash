// src/main.tsx
import "./theme.css";   // <- usar o arquivo que existe
import "./index.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

// CSS (ordem sugerida: tema primeiro = base; index.css depois = seus ajustes)
import "./styles/theme.css";
import "./index.css";

import App from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
