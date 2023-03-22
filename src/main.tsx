import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";
import * as Sentry from "@sentry/react";
import React from "react";
import ReactDOM from "react-dom/client";

import { version } from "../package.json";
import App from "./App";
import { functionsUrl } from "./lib/supabase";
import theme from "./theme";

if (import.meta.env.PROD) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    tunnel: `${functionsUrl}/sentry-tunnel`,
    release: `supabase-polls-frontend@${version}`,
    environment: import.meta.env.MODE,
  });
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <ChakraProvider>
    <ColorModeScript initialColorMode={theme.config.initialColorMode} />
    <App />
  </ChakraProvider>,
);
