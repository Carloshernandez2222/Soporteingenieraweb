import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { PanelThemeProvider } from "./context/PanelThemeContext";
import "./styles/tailwind.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <PanelThemeProvider>
          <App />
        </PanelThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
