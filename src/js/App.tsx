import { useEffect, useState, useRef } from "react";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { Login, Register, Forgot, Activate, Recovery } from "./Auth";
import Main from "./Main";
import { graphqlClient, config } from "./graphqlClient";
import { useSession, useSessionOutsideReact, SessionProvider } from "./SessionContext";
import Sidebar from "./Sidebar";

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const hasRedirected = useRef(false);
  const [loading, setLoading] = useState(true);
  const { isLoggedIn, setLoginStatus, cwid, userJSON, sessionJSON } = useSession();

  useEffect(() => {
    if (hasRedirected.current) return;

    const checkLoginStatus = async () => {
      console.log("App useEffect checkLoginStatus");
      let isLoggedInLocal = false;
      const sessionId = "??????????"; //localStorage.getItem("sessionId");
      //if (sessionId) {
      try {
        //console.log(`debug9  phototag sessionId: ${sessionId} cwid: ${cwid} config: ${JSON.stringify(config)}`);
        const result = await graphqlClient(`auth`, { type: "session", sessionId: sessionId, cwid: cwid });

        if (result?.auth?.ok) {
          setLoginStatus(true, result.auth.user, sessionId, cwid, result.auth.userJSON, result.auth.sessionJSON);
          isLoggedInLocal = true;
        }
      } catch (error) {
        console.log(`Failed to check session: ${String(error)}`);
      }
      //}

      if (isLoggedInLocal && location.pathname !== "/register" && location.pathname !== "/activate") {
        //if (location.pathname != config.mainApp) {
        const session = useSessionOutsideReact();
        //if (session.userJSON && (session.userJSON.appActive == "fm" || session.userJSON.appActive == "pralnia")) {
        if (session.userJSON && (session.userJSON.appActive == "fm" || session.userJSON.appActive == "pralnia") && config.mainApp && config.mainApp != "/") {
          //if (confirm(`Wykonać przekierowanie wg mainApp?\n ${session.userJSON.appActive} config.mainApp: ${config.mainApp}`)) {
          window.location.href = config.mainApp; // Zewnętrzny adres //?cwid=${cwid}
          //window.location.href = `${config.mainApp}?cwid=${cwid}`; // Zewnętrzny adres
          // } else {
          //   navigate("/"); // Wewnętrzne przekierowanie
          // }
        } else {
          navigate("/"); // Wewnętrzne przekierowanie
        }

        // if (config.mainApp.startsWith("http")) {
        //   window.location.href = `${config.mainApp}?cwid=${cwid}`; // Zewnętrzny adres
        // } else {
        //   navigate(config.mainApp); // Wewnętrzne przekierowanie
        // }
        //}
        hasRedirected.current = true;
      } else if (!isLoggedInLocal && location.pathname !== "/login" && location.pathname !== "/register" && location.pathname !== "/activate" && location.pathname !== "/recovery") {
        navigate("/login");
        hasRedirected.current = true;
      }
      hasRedirected.current = true;
      setLoading(false);
    };
    checkLoginStatus();
  }, [navigate, location, setLoginStatus /*, graphqlClient*/]);

  if (loading) {
    return null; // Renderowanie pustego komponentu, dopóki status logowania się ładuje
  }

  let mainActive;
  if (config?.withTabs) {
    mainActive = <MainTabs />;
  } else {
    mainActive = <Main />;
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/activate" element={<Activate />} />
      <Route path="/forgot" element={<Forgot />} />
      <Route path="/recovery" element={<Recovery />} />
      <Route path="/" element={mainActive} />
    </Routes>
  );
}

const MainTabs = () => {
  const [tabs, setTabs] = useState([
    {
      id: 1,
      title: "Main Tab",
      content: <Main addTab={null} />,
    },
  ]);
  const [activeTab, setActiveTab] = useState(1);

  const addTab = (title: any, content: any) => {
    const newTabId = tabs.length + 1;
    setTabs([...tabs, { id: newTabId, title, content }]);
    setActiveTab(newTabId);
  };

  return (
    <div className="flex h-screen">
      <Sidebar>
        <div className="flex flex-col flex-1">
          <Main />
        </div>
      </Sidebar>
    </div>
  );
};

function AppWrapper() {
  return (
    <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
      <SessionProvider>
        <App />
      </SessionProvider>
    </BrowserRouter>
  );
}

export default AppWrapper;

/*isModal={false}*/
/*
<button

            className="flex items-center w-3/10 p-1 my-1 text-lg font-semibold text-white bg-green-500 hover:bg-green-600 shadow-md transition-all duration-200"
            onClick={
              () => addTab(`Tab${String(Math.random()).substring(3, 7)}`, <Main addTab={addTab} />)
              //addTab(`Tab ${String(Math.random()).substing(0,3)}`, <Main addTab={addTab} />);
            }
          >
            Add New Tab
          </button>

          <div>
            <ul style={{ display: "flex", listStyle: "none", padding: 0 }}>
              {tabs.map((tab) => (
                <li
                  key={tab.id}
                  style={{
                    marginRight: "10px",
                    padding: "10px",
                    cursor: "pointer",
                    borderBottom: tab.id === activeTab ? "2px solid blue" : "none",
                  }}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.title}
                </li>
              ))}
            </ul>
          </div>
          <div>{tabs.map((tab) => tab.id === activeTab && <div key={tab.id}>{tab.content}</div>)}</div>
          */
