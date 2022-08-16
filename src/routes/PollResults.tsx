import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Button, Container, ScaleFade, Spinner, useToast,
} from '@chakra-ui/react';
import supabase from '../lib/supabase';
import { Poll } from '../lib/types';
import PollResultsChart from '../components/PollResultsChart';
import NotFound from '../components/NotFound';

export default function Results() {
  const navigate = useNavigate();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [poll, setPoll] = useState<Poll | null>(null);
  const [votedPolls] = useState<string[]>(
    JSON.parse(localStorage.getItem('voted-polls') || '[]'),
  );
  const { pollId } = useParams();

  if (!pollId) return <NotFound />;

  const fetchPoll = async () => {
    const { data, error } = await supabase
      .from('polls')
      .select('*')
      .eq('id', pollId);
    if (error) {
      console.log(error);
      toast({
        status: 'error',
        title: 'Error',
        description: error.message,
      });
    } else if (data === null) {
      toast({
        status: 'error',
        title: 'Error',
        description: 'Something went wrong while loading the poll.',
      });
    } else if (data.length > 0) {
      setPoll(data[0]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchPoll().catch(console.error);
  }, []);

  if (isLoading) {
    return (
      <Container centerContent>
        <Spinner size="xl" />
      </Container>
    );
  }

  if (poll) {
    return (
      <ScaleFade initialScale={0.9} in={!isLoading}>
        <Container maxW="container.lg" centerContent>
          <PollResultsChart poll={poll} />
          {votedPolls.indexOf(pollId) === -1 && (
            <Button mt={4} onClick={() => navigate(`/${pollId}`)}>
              Vote
            </Button>
          )}
        </Container>
      </ScaleFade>
    );
  }
  return <NotFound />;
}
