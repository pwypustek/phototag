import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { graphqlClient, config } from "./graphqlClient";
import { useSession, useSessionOutsideReact } from "./SessionContext";
import { useModal } from "./Modal";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { ModalComponent, openModal } = useModal();

  const { isLoggedIn, setLoginStatus, cwid, userJSON, sessionJSON } = useSession();

  const handleLogin = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (!password) {
      await openModal("Podaj hasło", { type: "alert" });
      return;
    }

    try {
      const result = await graphqlClient(`auth`, {
        type: "login",
        user: email,
        pass: password,
        cwid: cwid,
      });
      if (result?.auth?.ok) {
        //console.log(`debug15 phototag localStorage.setItem sessionId ${result.auth.sessionId}`);
        //localStorage.setItem("sessionId", result.auth.sessionId);
        setLoginStatus(true, email, result.auth.sessionId, result.auth.cwid, result.auth.userJSON, result.auth.sessionJSON);
        setTimeout(() => {
          //if (config.mainApp.startsWith("http")) {
          const session = useSessionOutsideReact();
          if (session.userJSON && (session.userJSON.appActive == "fm" || session.userJSON.appActive == "pralnia") && config.mainApp && config.mainApp != "/") {
            //alert(`Uwaga nastąpi przekierowanie wg appActive: ${session.userJSON.appActive} config.mainApp: ${config.mainApp}`);
            // if (confirm(`Wykonać przekierowanie wg mainApp?\n ${session.userJSON.appActive} config.mainApp: ${config.mainApp}`)) {
            window.location.href = config.mainApp; // Zewnętrzny adres //?cwid=${cwid}
            //window.location.href = `${config.mainApp}?cwid=${cwid}`; // Zewnętrzny adres
            // } else {
            //   navigate("/"); // Wewnętrzne przekierowanie
            // }
          } else {
            navigate("/"); // Wewnętrzne przekierowanie
          }
        }, 0);
      } else {
        await openModal("Błąd logowania", { type: "alert" });
      }
    } catch (error) {
      await openModal(`Error during login: ${JSON.stringify(error)}`, { type: "alert" });
      if (String(error).indexOf(`nie zostało aktywowane`) >= 0) {
        navigate("/activate");
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-3xl font-extrabold text-center text-gray-900 mb-4">{config?.title} Login</h1>
        <form onSubmit={handleLogin} className="space-y-4" autoComplete="on">
          <input type="email" name="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" autoComplete="username" />
          <input type="password" name="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" autoComplete="current-password" />
          <button type="submit" className="w-full p-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400">
            Log In
          </button>
        </form>
        <p className="text-center text-gray-600 mt-4">
          <Link to="/forgot" className="text-blue-500 hover:underline">
            Forgot Password?
          </Link>
        </p>
        <hr className="my-4" />
        <button onClick={() => navigate("/register")} className="w-full p-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400">
          Create New Account
        </button>
      </div>
      {ModalComponent}
    </div>
  );
}

function Forgot() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const { ModalComponent, openModal } = useModal();

  const handleForgot = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    try {
      const result = await graphqlClient(`auth`, {
        type: "forgot",
        user: email,
      });

      if (result && result.auth && result.auth.ok === true) {
        await openModal("Instrukcja logowania została przesłana na maila", { type: "alert" });
        setTimeout(() => navigate("/login"), 0); // Use setTimeout for navigating after submission
      } else {
        console.error("Forgot password failed:", result.errors);
        await openModal("Wystąpił błąd", { type: "alert" });
      }
    } catch (error) {
      await openModal(`Error during password reset: ${JSON.stringify(error)}`, { type: "alert" });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-3xl font-extrabold text-center text-gray-900 mb-4">{config?.title} Password recovery</h1>
        <form onSubmit={handleForgot} className="space-y-4" autoComplete="on">
          <input type="email" name="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" autoComplete="username" />
          <button type="submit" className="w-full p-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400">
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
      {ModalComponent}
    </div>
  );
}

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { ModalComponent, openModal } = useModal();
  const { setLoginStatus, cwid } = useSession();

  const handleRegister = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    try {
      const result = await graphqlClient(`auth`, {
        type: "register",
        user: email,
        passNew: password,
        cwid: cwid,
      });

      if (result && result.auth && result.auth.ok === true) {
        //localStorage.setItem("sessionId", result.auth.sessionId);
        //setLoginStatus(true, email, result.auth.sessionId, result.auth.cwid);
        await openModal(`Sprawdź email, aktywuj i zaloguj się`, { type: "alert" });
        setTimeout(() => navigate("/login"), 0);
      } else {
        await openModal(`Registration failed: ${JSON.stringify(result.errors)}`, { type: "alert" });
      }
    } catch (error) {
      await openModal(`Error during registration: ${JSON.stringify(error)}`, { type: "alert" });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-3xl font-extrabold text-center text-gray-900 mb-4">{config?.title} Register</h1>
        <form onSubmit={handleRegister} className="space-y-4" autoComplete="on">
          <input type="email" name="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" autoComplete="username" />
          <input type="password" name="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" autoComplete="new-password" />
          <button type="submit" className="w-full p-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400">
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
      {ModalComponent}
    </div>
  );
}

function Activate() {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [manualActivate, setManualActivate] = useState(false);
  const [activateProgress, setActivateProgress] = useState(`${config?.title} Activate`);
  const navigate = useNavigate();
  const { ModalComponent, openModal } = useModal();

  const handleEmailVerification = async (user: string, token: string) => {
    try {
      setActivateProgress(`Weryfikacja email...`);
      const result = await graphqlClient(`auth`, {
        type: "activate",
        user: user,
        token: token,
      });

      if (result && result.auth && result.auth.ok === true) {
        //localStorage.setItem("sessionId", result.auth.sessionId);
        //setLoginStatus(true, email, result.auth.sessionId, result.auth.cwid);
        setActivateProgress(`Zweryfikowano email ok`);
        setTimeout(() => navigate("/login"), 1000);
      } else {
        setActivateProgress(`Activation failed: ${JSON.stringify(result.errors)}`);
      }

      // const result = await verifyEmail({ variables: { token } });
      // if (result.data.verifyEmail.success) {
      //   alert('Email został zweryfikowany!');
      // } else {
      //   alert('Nie udało się zweryfikować e-maila.');
      // }
    } catch (error) {
      console.error(error);
      setActivateProgress(`${String(error)}`); //Wystąpił błąd podczas weryfikacji e-maila
      setTimeout(() => navigate("/login"), 1000);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const user = params.get("user");
    if (token && user) {
      handleEmailVerification(user, token);
    } else {
      setManualActivate(true);
    }
  }, []);

  const { setLoginStatus, cwid } = useSession();

  const handleSendActivateLink = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    try {
      const result = await graphqlClient(`auth`, {
        type: "sendActivateLink",
        user: email,
        //token: token,
      });

      if (result && result.auth && result.auth.ok === true) {
        //localStorage.setItem("sessionId", result.auth.sessionId);
        //setLoginStatus(true, email, result.auth.sessionId, result.auth.cwid);
        await openModal("Wiadomość została wysłana, sprawdź pocztę email", { type: "alert" });
        setTimeout(() => navigate("/login"), 0);
      } else {
        await openModal(`Activation failed: ${JSON.stringify(result.errors)}`, { type: "alert" });
      }
    } catch (error) {
      await openModal(`Error during activation: ${JSON.stringify(error)}`, { type: "alert" });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-3xl font-extrabold text-center text-gray-900 mb-4">{activateProgress}</h1>
        {manualActivate && (
          <form onSubmit={handleSendActivateLink} className="space-y-4" autoComplete="on">
            <input type="email" name="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" autoComplete="username" />
            {/* <input
            //type="password"
            name="token"
            placeholder="Token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            //autoComplete="new-password"
          /> */}
            <button type="submit" className="w-full p-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400">
              Wyślij ponownie wiadomość z linkiem aktywacyjnym
            </button>
          </form>
        )}
        <p className="text-center text-gray-600 mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-500 hover:underline">
            Log in here
          </Link>
        </p>
      </div>
      {ModalComponent}
    </div>
  );
}

function Recovery() {
  const [password1, setPassword1] = useState("");
  const [password2, setPassword2] = useState("");
  const [token, setToken] = useState("");
  const [user, setUser] = useState("");
  const [activateProgress, setActivateProgress] = useState(`${config?.title} password recovery`);
  const navigate = useNavigate();
  const { ModalComponent, openModal } = useModal();

  // const handleEmailVerification = async (user: string, token: string) => {
  //   try {
  //     setActivateProgress(`Weryfikacja email...`);
  //     const result = await graphqlClient(`auth`, {
  //       type: "recovery",
  //       user: user,
  //       token: token,
  //     });

  //     if (result && result.auth && result.auth.ok === true) {
  //       //localStorage.setItem("sessionId", result.auth.sessionId);
  //       //setLoginStatus(true, email, result.auth.sessionId, result.auth.cwid);
  //       setActivateProgress(`Ustawiono noweg hasło`);
  //       setTimeout(() => navigate("/login"), 1000);
  //     } else {
  //       //alert(`Activation failed: ${JSON.stringify(result.errors)}`);
  //       setActivateProgress(`Recovery failed: ${JSON.stringify(result.errors)}`);
  //     }

  //     // const result = await verifyEmail({ variables: { token } });
  //     // if (result.data.verifyEmail.success) {
  //     //   alert('Email został zweryfikowany!');
  //     // } else {
  //     //   alert('Nie udało się zweryfikować e-maila.');
  //     // }
  //   } catch (error) {
  //     console.error(error);
  //     setActivateProgress(`${String(error)}`); //Wystąpił błąd podczas weryfikacji e-maila
  //     setTimeout(() => navigate("/login"), 1000);
  //   }
  // };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const user = params.get("user");

    if (token && user) {
      setToken(token);
      setUser(user);
    } else {
      setActivateProgress(`Nieprawidłowy link, błędne parametry`); //: ${window.location.search}
    }
  }, []);

  const handleRecovery = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    try {
      if (password1 != password2) {
        await openModal("Hasła nie są identyczne", { type: "alert" });
        return null;
      }
      setActivateProgress(`Weryfikacja danych...`);
      const result = await graphqlClient(`auth`, {
        type: "recovery",
        user: user,
        token: token,
        password: password1,
      });

      if (result && result.auth && result.auth.ok === true) {
        setActivateProgress(`Weryfikacja ok`);
        await openModal("Hasło zostało zmienione, możesz się zalogować", { type: "alert" });
        setTimeout(() => navigate("/login"), 0);
      } else {
        setActivateProgress(`Błąd Weryfikacji danych`);
        await openModal(`Recovery failed: ${JSON.stringify(result.errors)}`, { type: "alert" });
      }
    } catch (error) {
      setActivateProgress(`Błąd odzyskiwania hasła`);
      await openModal(`Error during recovery: ${JSON.stringify(error)}`, { type: "alert" });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-3xl font-extrabold text-center text-gray-900 mb-4">{activateProgress}</h1>

        <form onSubmit={handleRecovery} className="space-y-4" autoComplete="on">
          <input type="password" name="password1" placeholder="Password" value={password1} onChange={(e) => setPassword1(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" autoComplete="new-password" />
          <input type="password" name="password2" placeholder="Password" value={password2} onChange={(e) => setPassword2(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" autoComplete="new-password" />
          <button type="submit" className="w-full p-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400">
            Ustaw hasło
          </button>
        </form>

        <p className="text-center text-gray-600 mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-500 hover:underline">
            Log in here
          </Link>
        </p>
      </div>
      {ModalComponent}
    </div>
  );
}

export { Login, Forgot, Register, Activate, Recovery };
