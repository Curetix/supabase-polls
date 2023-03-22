import {
  Alert,
  AlertIcon,
  Box,
  Center,
  Container,
  Flex,
  Heading,
  ScaleFade,
  Spacer,
  Spinner,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import NotFound from "../components/NotFound";
import PollResults from "../components/PollResults";
import PollVoteForm from "../components/PollVoteForm";
import { Poll } from "../lib/database.types";
import supabase from "../lib/supabase";

export default function Vote() {
  const toast = useToast();
  const boxBg = useColorModeValue("white", "gray.800");
  const [isLoading, setIsLoading] = useState(true);
  const [poll, setPoll] = useState<Poll | null>(null);
  const [votedPolls, setVotedPolls] = useState<string[]>(
    JSON.parse(localStorage.getItem("voted-polls") || "[]"),
  );
  const { pollId } = useParams();

  if (!pollId) return <NotFound />;

  const fetchPoll = async () => {
    const { data, error } = await supabase.from("polls").select("*").eq("id", pollId);
    if (error) {
      console.log(error);
      toast({
        status: "error",
        title: "Error",
        description: error.message,
      });
    } else if (data === null) {
      toast({
        status: "error",
        title: "Error",
        description: "Something went wrong while loading the poll.",
      });
    } else {
      setPoll(data[0]);
    }
    setIsLoading(false);
  };

  const voteCallback = () => {
    setVotedPolls([...votedPolls, pollId]);
    if (import.meta.env.PROD) {
      localStorage.setItem("voted-polls", JSON.stringify([...votedPolls, pollId]));
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
        <Center>
          <Heading paddingBottom={10} fontSize={{ base: "3xl", sm: "4xl", md: "5xl" }}>
            {poll.title}
          </Heading>
        </Center>

        <Flex alignItems="center" direction={["column", "column", "column", "row"]}>
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

            {!voted && !closed && <PollVoteForm poll={poll} voteCb={voteCallback} />}
          </Box>
          <Spacer />
          <Box p={3} boxShadow="2xl" rounded="md" bg={boxBg}>
            <PollResults poll={poll} />
          </Box>
        </Flex>
      </ScaleFade>
    );
  }
  return <NotFound />;
}
