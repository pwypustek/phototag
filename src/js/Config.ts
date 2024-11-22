let config;
async function fetchConfig() {
  const response = await fetch("./config.json");
  const config = await response.json();
  return config;
}

fetchConfig().then((config) => {
  console.log(config.backendUrl);
});

export default config;
