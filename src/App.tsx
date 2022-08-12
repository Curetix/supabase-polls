import { Grid, Text } from '@chakra-ui/react';
import ColorModeSwitcher from './components/ColorModeSwitcher';

function App() {
  return (
    <Grid minH="100vh" p={3}>
      <ColorModeSwitcher justifySelf="flex-end" />
      <Text>Hello World!</Text>
    </Grid>
  );
}

export default App;
