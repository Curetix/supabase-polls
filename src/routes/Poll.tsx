import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  useToast,
  Alert,
  AlertIcon,
  Container,
  Heading,
  ScaleFade,
  Spinner,
  Flex,
  Box,
  Spacer,
  Center,
} from '@chakra-ui/react';
import supabase from '../lib/supabase';
import { Poll } from '../lib/database.types';
import PollVoteForm from '../components/PollVoteForm';
import PollResults from '../components/PollResults';
import NotFound from '../components/NotFound';

export default function Vote() {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [poll, setPoll] = useState<Poll | null>(null);
  const [votedPolls, setVotedPolls] = useState<string[]>(
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
    setVotedPolls([...votedPolls, pollId]);
    if (import.meta.env.PROD) {
      localStorage.setItem('voted-polls', JSON.stringify([...votedPolls, pollId]));
    }
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
        <Container maxW="container.lg">
          <Center>
            <Heading paddingBottom={10} fontSize={{ base: '3xl', sm: '4xl', md: '6xl' }}>{poll.title}</Heading>
          </Center>

          <Flex maxWidth="container.lg" alignItems="center">
            <Box p={5}>
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
            </Box>
            <Spacer />
            <Box borderWidth="1px" borderRadius="lg" p={3}>
              <PollResults poll={poll} />
            </Box>
          </Flex>
        </Container>
      </ScaleFade>
    );
  }
  return <NotFound />;
}
