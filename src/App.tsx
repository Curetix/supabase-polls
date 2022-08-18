import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Grid } from '@chakra-ui/react';
import ColorModeSwitcher from './components/ColorModeSwitcher';
import Home from './routes/Home';
import CreatePoll from './routes/CreatePoll';
import PollVote from './routes/Poll';
import NotFound from './components/NotFound';

function App() {
  return (
    <Grid minH="100vh" p={3}>
      <ColorModeSwitcher justifySelf="flex-end" />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<CreatePoll />} />
          <Route path="/:pollId" element={<PollVote />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </Grid>
  );
}

export default App;
