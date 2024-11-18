let config: { backend: string | URL | Request; withTabs?: boolean };
import { useSession, useSessionOutsideReact } from "./SessionContext";

async function fetchConfig() {
  try {
    const response = await fetch("./config.json");
    if (!response.ok) {
      throw new Error("Failed to load config.json");
    }
    config = await response.json();
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
        params[`cwid`] = "todo"; //session.cwid
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
      throw new Error(
        `GraphQL error: ${response.status} ${response.statusText}`
      );
    }

    const responseData = await response.json();

    if (responseData.errors) {
      const errText = responseData.errors
        .map((error: { message: any }) => error.message)
        .join("\n");
      console.log(errText);
      throw new Error(errText);
    }

    return responseData.data;
  } catch (error) {
    console.error("Error during GraphQL request:", error);
    alert("Wystąpił błąd podczas wykonywania zapytania.");
    throw error;
  }
};

export { graphqlClient, config };
