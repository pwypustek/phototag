let config: { backend: string | URL | Request; withTabs?: boolean; mainApp: string; cwid?: string; title?: string };
import { useSession, useSessionOutsideReact } from "./SessionContext";

async function fetchConfig() {
  try {
    const response = await fetch("/config.json");
    if (!response.ok) {
      throw new Error("Failed to load config.json");
    }
    config = await response.json();
    config.mainApp = config.mainApp || "/";
    document.title = config?.title || "photoTag";
  } catch (error) {
    console.error("Error loading configuration:", error);
    alert("Nie udało się załadować konfiguracji aplikacji.");
    throw error; // Wyrzucamy błąd, aby zatrzymać działanie w przypadku braku konfiguracji
  }
}

const graphqlClient = async (method: string, params: any) => {
  try {
    if (!config) {
      await fetchConfig();
    }

    const session = useSessionOutsideReact();
    //console.log(`debug99 graphqlClient1 phototag sessionId: ${params["sessionId"]} cwid: ${params["cwid"]} config: ${JSON.stringify(config)} session: ${JSON.stringify(session)} params: ${JSON.stringify(params)}`);

    if (params[`sessionId`] && params[`cwid`]) {
      // ok
    } else {
      if (params.type == "session" || params.type == "login" || params.type == "register") {
        // sessionId i cwid jest już w parametrach
      } else {
        params[`sessionId`] = session.sessionId;
        params[`cwid`] = session.cwid;
      }
    }

    if (params[`cwid`]) {
      // ok
    } else {
      params[`cwid`] = config.cwid;
    }
    params[`cwid`] = "empty"; // na sztywno ponieważ coś z konfiguracji nie działa

    let query: string = `query { ${method}(params: { `;

    for (let i in params) {
      query += `${i}:"${params[i]}",`;
    }
    query = query.slice(0, -1); // ostatni przecinek wypierdalamy

    query += `})}`;

    let variables = {};
    //
    let fetchOptions: RequestInit;
    fetchOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "*/*", // Opcjonalnie, jeśli backend tego wymaga
      },
      credentials: "include",
      body: JSON.stringify({
        query,
        variables,
      }),
    };

    //
    //console.log(`fetch ${JSON.stringify(fetchOptions)}`);
    const response = await fetch(config.backend, fetchOptions);
    if (!response.ok) {
      alert(`GraphQL error`);
      throw new Error(`GraphQL error: ${response.status} ${response.statusText}`);
    }

    const responseData = await response.json();

    if (responseData.errors) {
      const errText = responseData.errors.map((error: { message: any }) => error.message).join("\n");
      console.log(errText);
      throw new Error(errText);
    }

    return responseData.data;
  } catch (error: any) {
    if (error.message) {
      throw error.message;
    } else {
      throw error;
    }
  }
};

async function getRandomString() {
  if (!config) {
    await fetchConfig();
  }
  console.log(`debug7  phototag ${config.cwid}`);
  if (config.cwid) {
    return config.cwid;
  } else {
    let cwid = null;
    try {
      cwid = sessionStorage.getItem("cwid");
      if (!cwid) {
        // unikalny identyfikator instancji aplikacji klienta, w celu rozróżneinia otwartej strony na tą samą sesję ale w osobnych zakładkach, aktywna baza danych itp
        //session.cwid = getRandomString();
        let arr = new Uint8Array(10);
        window.crypto.getRandomValues(arr);
        cwid = Array.from(arr, function dec2hex(dec) {
          return dec.toString(16).padStart(2, "0");
        }).join("");
        console.log(`cwid: ${cwid}`);
        sessionStorage.setItem("cwid", cwid);
      }
    } catch (e: any) {
      alert("(2) Twoja przeglądarka nie jest aktualna.\n\nUaktualnij lub uruchom inną przeglądarkę.\nnp. Google Chrome, Mozilla Firefox lub Microsoft Edge\n\n" + e.message);
    }
    return cwid;
  }
}

const LoadingIndicator = ({ progress }: { progress: number | null }) => {
  if (progress === null) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded shadow-lg text-center">
        <p>Ładowanie...</p>
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent border-solid rounded-full animate-spin mt-2"></div>

        {/* <p>Ładowanie... {progress}%</p>
        <div className="w-full bg-gray-200 rounded h-2 mt-2">
          <div className="bg-blue-500 h-2 rounded" style={{ width: `${progress}%` }}></div>
        </div> */}
      </div>
    </div>
  );
};

export { config, graphqlClient, getRandomString, LoadingIndicator };
