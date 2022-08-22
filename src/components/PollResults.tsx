import React, { useEffect, useState } from 'react';
import {
  useToast,
  useColorModeValue,
  Container,
  Spinner,
  Box,
  Center,
  Heading,
  HStack,
} from '@chakra-ui/react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { Theme as NivoThemeConfig } from '@nivo/core';
import { DefaultRawDatum, ResponsivePie } from '@nivo/pie';
import supabase from '../lib/supabase';
import {
  RealtimePayload, Poll, Vote, VoteCount,
} from '../lib/database.types';
import StatusIndicator from './StatusIndicator';

type Props = {
  poll: Poll;
};

type CenteredMetricProps = {
  dataWithArc: DefaultRawDatum[];
  centerX: number;
  centerY: number;
};

function CenteredMetric({ dataWithArc, centerX, centerY }: CenteredMetricProps) {
  let total = 0;
  dataWithArc.forEach((datum) => {
    total += datum.value;
  });

  return (
    <text
      x={centerX}
      y={centerY}
      fill={useColorModeValue('#000', '#FFF')}
      textAnchor="middle"
      dominantBaseline="central"
      style={{
        fontSize: '48px',
        fontWeight: 600,
      }}
    >
      {total}
    </text>
  );
}

export default function PollResults({ poll }: Props) {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [votes, setVotes] = useState<VoteCount[] | null>(null);
  const [totalVotes, setTotalVotes] = useState(0);
  const [subscription, setSubscription] = useState<RealtimeChannel | null>(null);
  const [chartData, setChartData] = useState<DefaultRawDatum[]>([]);
  const closed = new Date() >= new Date(poll.close_at);

  const nivoTheme: NivoThemeConfig = {
    textColor: useColorModeValue('#000', '#fff'),
    tooltip: {
      container: {
        background: useColorModeValue('#2D3748', '#CBD5E0'),
        color: useColorModeValue('#EFEFF1', '#171923'),
      },
    },
  };

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
      setTotalVotes(data.reduce((accum, current) => accum + current.votes, 0));
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
            console.log('Received realtime vote:', payload);
            const vote = payload.record || payload.new;
            const n = [...votes];
            const i = n.findIndex((v) => v.option === vote!.option);
            if (i > -1) n[i].votes += 1;
            setVotes(n);
            setTotalVotes(n.reduce((accum, current) => accum + current.votes, 0));
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
    setChartData(votes.map((v) => ({
      id: v.option,
      label: v.option,
      value: v.votes,
    })));
  }, [votes]);

  if (isLoading) {
    return (
      <Container centerContent>
        <Spinner size="xl" />
      </Container>
    );
  }

  return (
    <Box width={['sm', 'md', 'xl']} height={['sm', 'md', 'xl']}>
      <Center>
        <HStack>
          <Heading size="lg">Results</Heading>
          <Box paddingTop={1}>
            {subscription !== null && !closed && (
              <StatusIndicator active />
            )}
            {subscription === null && !closed && (
              <StatusIndicator active={false} />
            )}
          </Box>
        </HStack>
      </Center>

      <ResponsivePie
        theme={nivoTheme}
        data={chartData}
        margin={{
          top: 20, right: 100, bottom: 100, left: 100,
        }}
        animate
        sortByValue
        activeOuterRadiusOffset={5}
        activeInnerRadiusOffset={5}
        innerRadius={0.5}
        padAngle={0.7}
        cornerRadius={5}
        // Inside Labels
        enableArcLabels
        arcLabel={(d) => `${Math.round((d.value / totalVotes) * 100)}% (${d.value})`}
        arcLabelsSkipAngle={20}
        arcLabelsTextColor={{
          from: 'color',
          modifiers: [
            [
              'darker',
              3,
            ],
          ],
        }}
        // Outside Labels
        enableArcLinkLabels
        arcLinkLabelsSkipAngle={1}
        arcLinkLabelsThickness={2}
        arcLinkLabelsColor={{ from: 'color' }}
        layers={['arcs', 'arcLabels', 'arcLinkLabels', 'legends', CenteredMetric]}
      />
    </Box>
  );
}
