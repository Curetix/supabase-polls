import React, { useEffect, useState } from 'react';
import {
  useToast,
  Container,
  Heading,
  Spinner,
  VStack,
} from '@chakra-ui/react';
import { RealtimeChannel } from '@supabase/supabase-js';
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend, ChartData,
} from 'chart.js';
import { Pie } from 'react-chartjs-2';
import supabase from '../lib/supabase';
import {
  RealtimePayload, Poll, Vote, VoteCount,
} from '../lib/types';
import StatusIndicator from './StatusIndicator';

type Props = {
  poll: Poll;
};

ChartJS.register(ArcElement, Tooltip, Legend);

export default function PollResultsChart({ poll }: Props) {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [votes, setVotes] = useState<VoteCount[] | null>(null);
  const [subscription, setSubscription] = useState<RealtimeChannel | null>(null);
  const [chartData, setChartData] = useState<ChartData<'pie'>>({
    labels: votes?.map((v) => v.option),
    datasets: [],
  });
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
        .channel('public:votes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'votes',
            filter: `poll_id=eq.${poll.id}`,
          },
          (payload: RealtimePayload<Vote>) => {
            console.log('Received realtime vote');
            const n = [...votes];
            const i = n.findIndex((v) => v.option === payload.record.option);
            if (i > -1) n[i].votes += 1;
            setVotes(n);
          },
        );
      channel.subscribe(() => setSubscription(channel));
    }
  }, [votes]);

  useEffect(() => () => {
    if (subscription !== null) {
      supabase.removeChannel(subscription);
    }
  }, [subscription]);

  useEffect(() => {
    if (votes === null) return;
    setChartData({
      labels: votes!.map((v) => v.option),
      datasets: [
        {
          label: '# of votes',
          data: votes!.map((v) => v.votes),
          backgroundColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)',
          ],
        },
      ],
    });
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

      <Pie data={chartData} />
    </VStack>
  );
}
