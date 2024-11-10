let config: { backend: string | URL | Request };

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

const graphqlClient = async (
  query: string,
  variables?: { email?: string; password?: string }
) => {
  if (!config) {
    await fetchConfig();
  }

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
      throw new Error(
        `GraphQL error: ${response.status} ${response.statusText}`
      );
    }

  const responseData = await response.json();

  if (responseData.errors) {
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

export default graphqlClient;
