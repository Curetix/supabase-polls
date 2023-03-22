import { Box, Container, Divider } from "@chakra-ui/react";
import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import Navbar from "./components/Navbar";
import NotFound from "./components/NotFound";
import CreatePoll from "./routes/CreatePoll";
import Home from "./routes/Home";
import PollVote from "./routes/Poll";

function App() {
  return (
    <BrowserRouter>
      <Container maxWidth="container.lg" p={5}>
        <Navbar />
        <Divider />
        <Box paddingTop={10}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/create" element={<CreatePoll />} />
            <Route path="/:pollId" element={<PollVote />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Box>
      </Container>
    </BrowserRouter>
  );
}

export default App;
