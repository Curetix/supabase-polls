import type { ThemeConfig } from "@chakra-ui/react";

import { extendTheme } from "@chakra-ui/react";

const config: ThemeConfig = {
  initialColorMode: "system",
  useSystemColorMode: true,
  disableTransitionOnChange: false,
};

const theme = extendTheme({ config });

export default theme;
