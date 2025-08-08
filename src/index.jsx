import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App"; // Keep this as ./App for now
import "./styles.css";

const root = createRoot(document.getElementById("root"));
root.render(<App />);
