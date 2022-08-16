import React, { useEffect, useState } from 'react';
import {
  useToast,
  Container,
  Heading,
  ListItem,
  Spinner,
  UnorderedList,
  VStack,
} from '@chakra-ui/react';
import { RealtimeChannel } from '@supabase/supabase-js';
import supabase from '../lib/supabase';
import { Database, Poll } from '../lib/types';
import StatusIndicator from './StatusIndicator';

type Props = {
  poll: Poll;
};

type VoteCount = Database['public']['Functions']['count_poll_votes']['Returns'];

export default function PollResultsChart({ poll }: Props) {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [votes, setVotes] = useState<VoteCount[] | null>(null);
  const [subscription, setSubscription] = useState<RealtimeChannel | null>(null);
  const closed = new Date() >= new Date(poll.close_at);

  const fetchVotes = async () => {
    const { data, error } = await supabase.rpc('count_poll_votes', { poll: poll.id });
    if (error || !data) {
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
    if (votes !== null && subscription === null && !closed) {
      const channel = supabase
        .channel('votes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: `votes:poll_id=eq.${poll.id}`,
          },
          (payload: any) => {
            console.log('Received realtime vote');
            const n = [...votes];
            const i = n.findIndex((v) => v.option === payload.new.option);
            if (i > -1) n[i].votes += 1;
            setVotes(n);
          },
        );
      channel.subscribe();
      setSubscription(channel);
    }
    return () => {
      if (subscription !== null) {
        supabase.removeChannel(subscription);
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

      {subscription !== null && !closed && (
        <StatusIndicator active activeColor="red" />
      )}
      {subscription === null && !closed && (
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
