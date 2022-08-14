import React, { useState } from 'react';
import {
  useToast,
  Button,
  Heading,
  Radio,
  RadioGroup,
  Stack,
  VStack,
} from '@chakra-ui/react';
import { CastVoteResponse, Poll } from '../lib/types';
import supabase from '../lib/supabase';

type Props = {
  poll: Poll;
  voteCb: Function;
};

export default function PollVoteForm({ poll, voteCb }: Props) {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState(poll.options[0]);
  const colors = [
    'red',
    'orange',
    'yellow',
    'green',
    'teal',
    'blue',
    'cyan',
    'purple',
    'pink',
  ];

  const options = [];

  for (let i = 0; i < poll.options.length; i += 1) {
    options.push(
      <Radio
        key={i}
        colorScheme={colors[Math.floor(Math.random() * colors.length)]}
        size="lg"
        value={poll.options[i]}
      >
        {poll.options[i]}
      </Radio>,
    );
  }

  async function castVote() {
    setIsLoading(true);
    const { data, error } = await supabase.functions.invoke<CastVoteResponse>(
      'cast-vote',
      {
        body: JSON.stringify({
          pollId: poll.id,
          voteOption: selectedOption,
        }),
      },
    );
    setIsLoading(false);
    if (error !== null || !data.ok || !data.vote) {
      toast({
        status: 'error',
        title: 'Error',
        description: error ? error.message : data.message,
        duration: 10000,
        isClosable: true,
      });
    } else {
      toast({
        description: data.message,
        duration: 5000,
        isClosable: true,
      });
      voteCb();
    }
  }

  return (
    <VStack spacing={10}>
      <Heading fontSize={{ base: '3xl', sm: '4xl', md: '6xl' }}>{poll.title}</Heading>

      <RadioGroup value={selectedOption} onChange={setSelectedOption}>
        <Stack>{options}</Stack>
      </RadioGroup>

      <Button size="lg" colorScheme="green" onClick={() => castVote()} isLoading={isLoading}>
        Vote
      </Button>
    </VStack>
  );
}
