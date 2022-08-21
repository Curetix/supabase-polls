import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Box, Container, Divider } from '@chakra-ui/react';
import Navbar from './components/Navbar';
import Home from './routes/Home';
import CreatePoll from './routes/CreatePoll';
import PollVote from './routes/Poll';
import NotFound from './components/NotFound';

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
