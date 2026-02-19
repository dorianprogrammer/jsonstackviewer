import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

// Suppress Monaco's internal "Canceled" rejections from async operations
// that get cancelled mid-flight when the editor disposes (e.g. WordHighlighter).
// This is noise — it has no functional impact.
window.addEventListener("unhandledrejection", (event) => {
  if (event.reason?.message === "Canceled") {
    event.preventDefault();
  }
});

const root = createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
