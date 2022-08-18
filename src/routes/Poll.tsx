import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  useToast,
  Alert,
  AlertIcon,
  Button,
  Container,
  Heading,
  ScaleFade,
  Spinner,
  VStack,
} from '@chakra-ui/react';
import supabase from '../lib/supabase';
import { Poll } from '../lib/types';
import PollVoteForm from '../components/PollVoteForm';
import PollResults from "../components/PollResults";
import NotFound from '../components/NotFound';

export default function Vote() {
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
    } else {
      setPoll(data[0]);
    }
    setIsLoading(false);
  };

  const voteCallback = () => {
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
    const voted = votedPolls.indexOf(pollId) > -1;
    const closed = new Date() >= new Date(poll.close_at);

    return (
      <ScaleFade initialScale={0.9} in={!isLoading}>
        <Container maxW="container.lg" centerContent>
          <VStack spacing={8}>
            <Heading fontSize={{ base: '3xl', sm: '4xl', md: '6xl' }}>{poll.title}</Heading>

            {voted && (
              <Alert status="warning" variant="solid">
                <AlertIcon />
                You already voted in this poll.
              </Alert>
            )}

            {closed && (
              <Alert status="warning" variant="solid">
                <AlertIcon />
                Voting is closed for this poll.
              </Alert>
            )}

            {!voted && !closed && (
              <PollVoteForm poll={poll} voteCb={voteCallback} />
            )}

            <PollResults poll={poll} />
          </VStack>
        </Container>
      </ScaleFade>
    );
  }
  return <NotFound />;
}