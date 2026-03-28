import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { AuthProvider } from "./context/AuthContext.jsx"; // Context'imizi içeri aldık

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* Tüm uygulamayı AuthProvider ile sarmaladık */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
);
