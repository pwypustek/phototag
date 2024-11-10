import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import graphqlClient from "./graphqlClient";
import { useSession } from "./SessionContext";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const { setLoginStatus } = useSession();

  const handleLogin = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (!password) {
      alert("Podaj hasło");
      return;
    }

    try {
      const cwid = "todo";
      const result = await graphqlClient(
        `
         query {
             auth(params: { type: "login", user: "${email}", pass: "${password}", cwid: "${cwid}" })
         }
      `
      );

      if (result?.auth?.ok) {
        localStorage.setItem("sessionId", result.auth.sessionId);
        setLoginStatus(true, email);
        setTimeout(() => navigate("/"), 0);
      } else {
        alert("Błąd logowania");
      }
    } catch (error) {
      console.error("Error during login", error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-3xl font-extrabold text-center text-gray-900 mb-4">
          photoTag Login
        </h1>
        <form onSubmit={handleLogin} className="space-y-4" autoComplete="on">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            autoComplete="username"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            autoComplete="current-password"
          />
          <button
            type="submit"
            className="w-full p-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            Log In
          </button>
        </form>
        <p className="text-center text-gray-600 mt-4">
          <Link to="/forgot" className="text-blue-500 hover:underline">
            Forgot Password?
          </Link>
        </p>
        <hr className="my-4" />
        <button
          onClick={() => navigate("/register")}
          className="w-full p-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400"
        >
          Create New Account
        </button>
      </div>
    </div>
  );
}

function Forgot() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleForgot = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    try {
      const result = await graphqlClient(
        `
        query {
            auth(params: { type: "forgot", user: "${email}" })
        }
     `
      );

      if (result && result.auth && result.auth.ok === true) {
        alert("Instrukcja logowania została przesłana na maila");
        setTimeout(() => navigate("/login"), 0); // Use setTimeout for navigating after submission
      } else {
        console.error("Forgot password failed:", result.errors);
        alert("Wystąpił błąd");
      }
    } catch (error) {
      console.error("Error during password reset", error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-3xl font-extrabold text-center text-gray-900 mb-4">
          photoTag Password recovery
        </h1>
        <form onSubmit={handleForgot} className="space-y-4" autoComplete="on">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            autoComplete="username"
          />
          <button
            type="submit"
            className="w-full p-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            Password recovery
          </button>
        </form>
        <p className="text-center text-gray-600 mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-500 hover:underline">
            Log in here
          </Link>
        </p>
      </div>
    </div>
  );
}

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const { setLoginStatus } = useSession();

  const handleRegister = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    try {
      const cwid = "todo";
      const result = await graphqlClient(
        `
        query {
            auth(params: { type: "register", user: "${email}", passNew: "${password}", cwid: "${cwid}" })
        }
     `,
        { email: email, password: password }
      );

      if (result && result.auth && result.auth.ok === true) {
        localStorage.setItem("sessionId", result.auth.sessionId);
        setLoginStatus(true, email);
        setTimeout(() => navigate("/"), 0);
      } else {
        console.error("Registration failed:", result.errors);
      }
    } catch (error) {
      console.error("Error during registration", error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-3xl font-extrabold text-center text-gray-900 mb-4">
          photoTag Register
        </h1>
        <form onSubmit={handleRegister} className="space-y-4" autoComplete="on">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            autoComplete="username"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            autoComplete="new-password"
          />
          <button
            type="submit"
            className="w-full p-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            Register
          </button>
        </form>
        <p className="text-center text-gray-600 mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-500 hover:underline">
            Log in here
          </Link>
        </p>
      </div>
    </div>
  );
}

export { Login, Forgot, Register };
