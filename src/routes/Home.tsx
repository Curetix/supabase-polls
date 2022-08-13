import React from 'react';
import { Container } from '@chakra-ui/react';
import PollCreationForm from '../components/PollCreationForm';

export default function Home() {
  return (
    <Container>
      <PollCreationForm />
    </Container>
  );
}
