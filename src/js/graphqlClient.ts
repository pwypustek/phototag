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
  if (!config) {
    console.log(`Brak konfiguracji pobieram`);
    await fetchConfig();
  } else {
    console.log(`Konfiguracja ok`);
  }

  const session = useSessionOutsideReact();
  debugger;

  if (params[`sessionId`] && params[`cwid`]) {
    // ok
  } else {
    params[`sessionId`] = session.sessionId;
    params[`cwid`] = session.cwid
  }

  let query: string = 
  `query { ${method}(params: { `;

  for (let i in params) {
    query += `${i}:"${params[i]}",`;
  }
  query = query.slice(0, -1); // ostatni przecinek wypierdalamy
  
  query += `})}`;

  let variables = {};
  try {
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
      console.log(`Error responseData.errors`);
      const errText = responseData.errors
        .map((error: { message: any }) => error.message)
        .join("\n");
      alert(errText);
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
