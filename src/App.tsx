import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Grid } from '@chakra-ui/react';
import ColorModeSwitcher from './components/ColorModeSwitcher';
import Home from './routes/Home';
import PollCreation from './routes/PollCreation';
import PollVote from './routes/PollVote';
import PollResults from './routes/PollResults';
import NotFound from './components/NotFound';

function App() {
  return (
    <Grid minH="100vh" p={3}>
      <ColorModeSwitcher justifySelf="flex-end" />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<PollCreation />} />
          <Route path="/:pollId" element={<PollVote />} />
          <Route path="/:pollId/results" element={<PollResults />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </Grid>
  );
}

export default App;
