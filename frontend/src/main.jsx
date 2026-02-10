import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./styles.css";
import { AuthProvider } from "./state/AuthContext.jsx";
import { AssessmentProvider } from "./state/AssessmentContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AssessmentProvider>
          <App />
        </AssessmentProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);

