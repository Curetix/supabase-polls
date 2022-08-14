import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Button, Container, ScaleFade, Spinner, useToast,
} from '@chakra-ui/react';
import PollVoteForm from '../components/PollVoteForm';
import NotFound from '../components/NotFound';
import supabase from '../lib/supabase';
import { Poll as PollType } from '../lib/types';

export default function Vote() {
  const navigate = useNavigate();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [poll, setPoll] = useState<PollType | null>(null);
  const [votedPolls] = useState<string[]>(
    JSON.parse(localStorage.getItem('voted-polls') || '[]'),
  );
  const { pollId } = useParams();

  if (!pollId) return <NotFound />;
  if (votedPolls.indexOf(pollId) > -1) navigate(`/${pollId}/results`);

  const fetchPoll = async () => {
    const { data, error } = await supabase
      .from<PollType>('polls')
      .select('*')
      .eq('shareable_id', pollId);
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
    } else {
      setPoll(data[0]);
    }
    setIsLoading(false);
  };

  const votedCurrentPoll = () => {
    if (import.meta.env.PROD) {
      localStorage.setItem('voted-polls', JSON.stringify([...votedPolls, pollId]));
    }
    navigate(`/${pollId}/results`);
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
          <PollVoteForm poll={poll} voteCb={votedCurrentPoll} />
          <Button mt={4} onClick={() => navigate(`/${pollId}/results`)}>
            Show Results
          </Button>
        </Container>
      </ScaleFade>
    );
  }
  return <NotFound />;
}
