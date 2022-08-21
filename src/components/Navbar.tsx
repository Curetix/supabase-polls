import { useLocation, useNavigate } from 'react-router-dom';
import {
  Flex,
  Button,
  Spacer,
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import ColorModeSwitcher from './ColorModeSwitcher';

export default function withAction() {
  const navigate = useNavigate();
  const location = useLocation();
  console.log(location);
  return (
    <Flex
      p={4}
      paddingTop={8}
      as="nav"
    >
      <Button
        isActive={location.pathname === '/'}
        variant="outline"
        onClick={() => navigate('/')}
      >
        Home
      </Button>
      <Spacer />
      <Button
        isActive={location.pathname === '/create'}
        rightIcon={<AddIcon />}
        variant="outline"
        colorScheme="green"
        onClick={() => navigate('/create')}
      >
        Create Poll
      </Button>
      <ColorModeSwitcher />
    </Flex>
  );
}
