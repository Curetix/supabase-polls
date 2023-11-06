import type { AppProps } from "next/app";

import { Box, ChakraProvider, Container, Divider } from "@chakra-ui/react";
import React from "react";
import Navbar from "@/components/Navbar";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider>
      <Container maxWidth="container.lg" p={5}>
        <Navbar />
        <Divider />
        <Box paddingTop={10}>
          <Component {...pageProps} />
        </Box>
      </Container>
    </ChakraProvider>
  );
}
