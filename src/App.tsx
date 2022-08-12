import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Grid } from '@chakra-ui/react';
import ColorModeSwitcher from './components/ColorModeSwitcher';
import Home from './routes/Home';

function App() {
  return (
    <Grid minH="100vh" p={3}>
      <ColorModeSwitcher justifySelf="flex-end" />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </Grid>
  );
}

export default App;
