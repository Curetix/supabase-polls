import { Alert, AlertIcon, Box, Center, Flex, Heading, ScaleFade, Spacer } from "@chakra-ui/react";
import { useState } from "react";
import NotFound from "@/components/NotFound";
import PollResults from "@/components/PollResults";
import PollVoteForm from "@/components/PollVoteForm";
import { Poll } from "@/types/common";
import { Database } from "@/types/database";
import { createPagesServerClient } from "@supabase/auth-helpers-nextjs";
import { GetServerSideProps } from "next";

type PollPageProps = {
  pollId: string;
  poll: Poll;
};

export const getServerSideProps: GetServerSideProps<PollPageProps> = async (context) => {
  const pollId = context.query.pollId as string;
  const supabase = createPagesServerClient<Database>(context);
  const { data: polls, error } = await supabase.from("polls").select("*").eq("id", pollId);

  if (!polls || error) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      pollId,
      poll: polls[0],
    },
  };
};

export default function PollPage({ pollId, poll }: PollPageProps) {
  const [votedPolls, setVotedPolls] = useState<string[]>(
    // JSON.parse(localStorage.getItem("voted-polls") || "[]"),
    [],
  );

  const voteCallback = () => {
    setVotedPolls([...votedPolls, pollId]);
    // if (process.env.NODE_ENV === "production") {
    //   localStorage.setItem("voted-polls", JSON.stringify([...votedPolls, pollId]));
    // }
  };

  if (poll) {
    const voted = votedPolls.indexOf(pollId) > -1;
    const closed = new Date() >= new Date(poll.close_at);

    return (
      <ScaleFade initialScale={0.9} in={true}>
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
          <Box p={3} boxShadow="2xl" rounded="md" bg="white" _dark={{ bg: "gray.800" }}>
            <PollResults poll={poll} />
          </Box>
        </Flex>
      </ScaleFade>
    );
  }
  return <NotFound />;
}
