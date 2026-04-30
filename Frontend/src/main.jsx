import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthProvider.jsx";
import { BrowserRouter } from "react-router-dom";
import { SocketProvider } from "./context/SocketContext.jsx";
import { E2EEProvider } from "./context/E2EEContext.jsx";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AuthProvider>
      <E2EEProvider>
        <SocketProvider>
          <App />
        </SocketProvider>
      </E2EEProvider>
    </AuthProvider>
  </BrowserRouter>,
);
