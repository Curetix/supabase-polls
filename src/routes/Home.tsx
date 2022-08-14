import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  VStack,
  Alert,
  Spinner,
  useToast,
  Heading,
  Button,
} from '@chakra-ui/react';
import { FaChevronRight } from 'react-icons/all';
import { Poll as PollType } from '../lib/types';
import supabase from '../lib/supabase';

export default function Home() {
  const navigate = useNavigate();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [polls, setPolls] = useState<PollType[] | null>(null);

  const fetchPoll = async () => {
    const { data, error } = await supabase
      .from<PollType>('polls')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    if (error) {
      console.log(error);
      toast({
        status: 'error',
        title: 'Error',
        description: error.message,
      });
    } else if (data === null || data.length === 0) {
      toast({
        status: 'error',
        title: 'Error',
        description: 'Something went wrong while loading the poll.',
      });
    } else {
      setPolls(data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchPoll().catch(console.error);
  }, []);

  return (
    <VStack spacing={10}>
      { isLoading && <Spinner size="xl" /> }
      { polls && (
        <VStack spacing={4}>
          <Heading fontSize={{ base: '3xl' }}>Latest Polls</Heading>
          {polls?.map((p) => (
            <Button
              colorScheme="blue"
              variant="outline"
              rightIcon={<FaChevronRight />}
              onClick={() => navigate(`/${p.shareable_id}`)}
            >
              { p.title }
            </Button>
          ))}
        </VStack>
      )}
      {!polls && !isLoading && <Alert status="error">Oops, could not load latest polls.</Alert>}

      <Button
        size="lg"
        colorScheme="green"
        onClick={() => navigate('/create')}
      >
        Create a Poll
      </Button>
    </VStack>
  );
}
