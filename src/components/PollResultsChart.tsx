import React, { useEffect, useState } from 'react';
import {
  Container,
  Heading,
  HStack,
  ListItem,
  Spinner,
  UnorderedList,
  useToast,
  VStack,
} from '@chakra-ui/react';
import { RealtimeSubscription } from '@supabase/supabase-js';
import { Poll, Vote } from '../lib/types';
import supabase from '../lib/supabase';
import StatusIndicator from './StatusIndicator';

type Props = {
  poll: Poll;
};

type VoteCount = {
  option: string,
  votes: number,
};

export default function PollResultsChart({ poll }: Props) {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [votes, setVotes] = useState<VoteCount[] | null>(null);
  const [subscription, setSubscription] = useState<RealtimeSubscription | null>(null);

  const fetchVotes = async () => {
    const { data, error } = await supabase
      .rpc<VoteCount>('count_poll_votes', { poll: poll.id });
    if (error || data === null) {
      console.log(error);
      toast({
        status: 'error',
        title: 'Error',
        description: 'Something went wrong while loading the votes.',
      });
    } else {
      setVotes(data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchVotes().catch(console.error);
  }, []);

  useEffect(() => {
    if (votes !== null && subscription === null) {
      const sub = supabase
        .from<Vote>(`votes:poll_id=eq.${poll.id}`)
        .on('INSERT', (payload) => {
          console.log('Received realtime vote');
          const n = [...votes];
          const i = n.findIndex((v) => v.option === payload.new.option);
          if (i > -1) n[i].votes += 1;
          setVotes(n);
        })
        .subscribe();
      setSubscription(sub);
    }
    return () => {
      if (subscription !== null) {
        supabase.removeSubscription(subscription);
      }
    };
  }, [votes]);

  if (isLoading) {
    return (
      <Container centerContent>
        <Spinner size="xl" />
      </Container>
    );
  }

  return (
    <VStack spacing={8}>
      <Heading fontSize={{ base: '3xl', sm: '4xl', md: '6xl' }}>{poll.title}</Heading>

      {subscription !== null ? (
        <StatusIndicator active activeColor="red" />
      ) : (
        <StatusIndicator active={false} activeColor="red" />
      )}

      <UnorderedList>
        {votes?.map((v) => (
          <ListItem key={v.option}>
            {`${v.option}: ${v.votes}`}
          </ListItem>
        ))}
      </UnorderedList>
    </VStack>
  );
}
