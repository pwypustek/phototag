import { useEffect, useState, useRef } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { Login, Register, Forgot } from "./Auth";
import Main from "./Main";
import graphqlClient from "./graphqlClient";
import { useSession } from "./SessionContext";

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const hasRedirected = useRef(false);
  const [loading, setLoading] = useState(true);
  const { isLoggedIn, setLoginStatus } = useSession();

  useEffect(() => {
    if (hasRedirected.current) return;

    const checkLoginStatus = async () => {
      let isLoggedInLocal = false;
      const cwid = "todo";
      const sessionId = localStorage.getItem("sessionId");
      if (sessionId) {
        const result = await graphqlClient(
          `
          query {
              auth(params: { type: "session", sessionId: "${sessionId}", cwid: "${cwid}" })
          }
        `
        );

        if (result?.auth?.ok) {
          setLoginStatus(true, result.auth.user);
          isLoggedInLocal = true;
        }
      }

      if (isLoggedInLocal && location.pathname !== "/register") {
        navigate("/");
        hasRedirected.current = true;
      } else if (
        !isLoggedInLocal &&
        location.pathname !== "/login" &&
        location.pathname !== "/register"
      ) {
        navigate("/login");
        hasRedirected.current = true;
      }
      hasRedirected.current = true;
      setLoading(false);
    };
    checkLoginStatus();
  }, [navigate, location]);

  if (loading) {
    return null; // Renderowanie pustego komponentu, dopóki status logowania się ładuje
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot" element={<Forgot />} />

      <Route path="/" element={<Main />} />
    </Routes>
  );
}

import { SessionProvider } from "./SessionContext";

function AppWrapper() {
  return (
    <Router>
      <SessionProvider>
        <App />
      </SessionProvider>
    </Router>
  );
}

export default AppWrapper;
