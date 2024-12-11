let config: { backend: string | URL | Request; withTabs?: boolean; mainApp: string };
import { useSession, useSessionOutsideReact } from "./SessionContext";

async function fetchConfig() {
  try {
    const response = await fetch("/config.json");
    if (!response.ok) {
      throw new Error("Failed to load config.json");
    }
    config = await response.json();
    config.mainApp = config.mainApp || "/";
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

    if (params[`sessionId`] && params[`cwid`]) {
      // ok
    } else {
      if (method == "session" || method == "login" || method == "register") {
        // sessionId i cwid jest już w parametrach
      } else {
        params[`sessionId`] = session.sessionId;
        params[`cwid`] = session.cwid;
      }
    }

    let query: string = `query { ${method}(params: { `;

    for (let i in params) {
      query += `${i}:"${params[i]}",`;
    }
    query = query.slice(0, -1); // ostatni przecinek wypierdalamy

    query += `})}`;

    let variables = {};
    const response = await fetch(config.backend, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

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

function getRandomString() {
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

export { config, graphqlClient, getRandomString };
