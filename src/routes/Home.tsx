import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useToast,
  VStack,
  Alert,
  Spinner,
  Heading,
  Button,
  ScaleFade,
} from '@chakra-ui/react';
import { FaChevronRight } from 'react-icons/all';
import supabase from '../lib/supabase';
import { Poll } from '../lib/database.types';

export default function Home() {
  const navigate = useNavigate();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [polls, setPolls] = useState<Poll[] | null>(null);

  const fetchPoll = async () => {
    const { data, error } = await supabase
      .from('polls')
      .select('*')
      .eq('is_unlisted', false)
      .order('created_at', { ascending: false })
      .limit(5);
    if (error) {
      console.error(error);
      toast({
        status: 'error',
        title: 'Error',
        description: error.message,
      });
    } else if (data === null) {
      console.warn('Data is null.');
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
    <ScaleFade initialScale={0.9} in>
      <VStack spacing={10}>
        <Heading fontSize={{ base: '3xl', sm: '4xl', lg: '5xl' }}>Latest Polls</Heading>

        { isLoading && <Spinner size="xl" /> }
        { polls !== null && polls.length > 0 && !isLoading && (
        <VStack spacing={4}>
          {polls?.map((p) => (
            <Button
              key={p.id}
              colorScheme="blue"
              variant="outline"
              rightIcon={<FaChevronRight />}
              onClick={() => navigate(`/${p.id}`)}
            >
              { p.title }
            </Button>
          ))}
        </VStack>
        )}

        {polls !== null && polls.length === 0 && !isLoading && (
        <Alert status="info">No polls found.</Alert>
        )}
        {polls === null && !isLoading && (
        <Alert status="error">Oops, could not load latest polls.</Alert>
        )}

        <Button
          size="lg"
          colorScheme="green"
          onClick={() => navigate('/create')}
        >
          Create your own Poll
        </Button>
      </VStack>
    </ScaleFade>
  );
}
