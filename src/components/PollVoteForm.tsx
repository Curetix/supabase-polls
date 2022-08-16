import React, { useState } from 'react';
import {
  useToast,
  Button,
  Radio,
  RadioGroup,
  Stack,
  VStack, CheckboxGroup, Checkbox,
} from '@chakra-ui/react';
import supabase from '../lib/supabase';
import { CastVoteResponse, Poll } from '../lib/types';

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
        body: JSON.stringify({
          pollId: poll.id,
          voteOption: poll.allow_multiple_answers ? selectedOptions : selectedOption,
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
    <VStack spacing={5}>
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
