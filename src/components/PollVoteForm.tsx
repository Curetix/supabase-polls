import React, { useState } from 'react';
import {
  useToast,
  Button,
  Radio,
  RadioGroup,
  Stack,
  VStack,
  CheckboxGroup,
  Checkbox,
  Heading,
} from '@chakra-ui/react';
import supabase from '../lib/supabase';
import { CastVoteResponse, Poll } from '../lib/database.types';

type Props = {
  poll: Poll;
  voteCb: Function;
};

export default function PollVoteForm({ poll, voteCb }: Props) {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<(string | number)[]>([]);
  const colors = [
    'red',
    'green',
    'orange',
    'blue',
    'purple',
  ];

  async function castVote() {
    setIsLoading(true);
    const { data, error } = await supabase.functions.invoke<CastVoteResponse>(
      'cast-vote',
      {
        body: {
          pollId: poll.id,
          voteOption: poll.allow_multiple_answers ? selectedOptions : selectedOption,
        },
      },
    );
    setIsLoading(false);
    if (error !== null || !data) {
      toast({
        status: 'error',
        title: 'Error',
        description: error ? error.message : 'Something went wrong.',
        duration: 10000,
        isClosable: true,
      });
    } else if (!data.ok || !data.vote) {
      toast({
        status: 'error',
        title: 'Error',
        description: data.message,
        duration: 10000,
        isClosable: true,
      });
    } else {
      toast({
        title: 'Success',
        description: data.message,
        duration: 5000,
        isClosable: true,
      });
      voteCb();
    }
  }

  return (
    <VStack spacing={5}>
      <Heading size="lg">Cast your Vote</Heading>
      {poll.allow_multiple_answers ? (
        <CheckboxGroup onChange={setSelectedOptions}>
          <Stack>
            {poll.options.map((option, index) => (
              <Checkbox
                colorScheme={colors[index]}
                size="lg"
                key={option}
                value={option}
              >
                {option}
              </Checkbox>
            ))}
          </Stack>
        </CheckboxGroup>
      ) : (
        <RadioGroup onChange={setSelectedOption}>
          <Stack>
            {poll.options.map((option, index) => (
              <Radio
                colorScheme={colors[index]}
                size="lg"
                key={option}
                value={option}
              >
                {option}
              </Radio>
            ))}
          </Stack>
        </RadioGroup>
      )}

      <Button
        size="lg"
        colorScheme="green"
        onClick={() => castVote()}
        isLoading={isLoading}
        disabled={selectedOption === '' && selectedOptions.length === 0}
      >
        Vote
      </Button>
    </VStack>
  );
}
