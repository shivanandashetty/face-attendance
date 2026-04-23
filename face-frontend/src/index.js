import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { darkGlassTheme } from "./theme";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <ThemeProvider theme={darkGlassTheme}>
    <CssBaseline />
    <App />
  </ThemeProvider>
);
