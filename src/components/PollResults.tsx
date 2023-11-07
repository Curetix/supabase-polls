import {
  Badge,
  Box,
  Center,
  Container,
  Heading,
  HStack,
  Spinner,
  useToast,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import ECharts from "@/components/ECharts";
import { Poll, VoteCount } from "@/types/common";
import { Database } from "@/types/database";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

type PollResultsProps = {
  poll: Poll;
};

export default function PollResults({ poll }: PollResultsProps) {
  const toast = useToast();
  const supabase = createClientComponentClient<Database>();
  const [isLoading, setIsLoading] = useState(true);
  const [isRealtime, setIsRealtime] = useState(false);
  const [votes, setVotes] = useState<VoteCount>([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const closed = new Date() >= new Date(poll.close_at);

  const [chartData, setChartData] = useState<{ name: string; value: number }[]>();

  const fetchVotes = async () => {
    const { data, error } = await supabase.rpc("count_poll_votes", { poll: poll.id });
    if (error || !data) {
      console.log(error);
      toast({
        status: "error",
        title: "Error",
        description: "Something went wrong while loading the votes.",
      });
    } else {
      setVotes(data);
      setTotalVotes(data.reduce((accum: number, current: any) => accum + current.votes, 0));
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchVotes().catch(console.error);

    const channel = supabase
      .channel("public:votes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "votes",
          filter: `poll_id=eq.${poll.id}`,
        },
        (payload) => {
          console.debug("Received realtime vote:", payload);
          const vote = payload.new;

          setVotes((votes) => {
            const n = [...votes];
            const i = n.findIndex((v) => v.option === vote!.option);
            if (i > -1) n[i].votes += 1;
            return n;
          });
        },
      )
      .subscribe(() => setIsRealtime(true));

    return () => {
      supabase.removeChannel(channel).then(() => setIsRealtime(false));
    };
  }, []);

  useEffect(() => {
    setTotalVotes(votes.reduce((accum, current) => accum + current.votes, 0));
    setChartData(
      votes.map((v) => ({
        name: v.option,
        value: v.votes,
      })),
    );
  }, [votes]);

  if (isLoading) {
    return (
      <Container centerContent>
        <Spinner size="xl" />
      </Container>
    );
  }

  return (
    <Box width={["sm", "md", "xl"]} height={["sm", "md", "xl"]}>
      <Center>
        <HStack>
          <Heading size="lg">Results</Heading>
          {isRealtime !== null && !closed && (
            <Box paddingTop={1}>
              <Badge colorScheme="green">Realtime</Badge>
            </Box>
          )}
        </HStack>
      </Center>

      <ECharts
        option={{
          tooltip: {
            trigger: "item",
          },
          legend: {
            top: "5%",
            left: "center",
          },
          backgroundColor: "transparent",
          series: [
            {
              type: "pie",
              radius: ["40%", "70%"],
              avoidLabelOverlap: false,
              itemStyle: {
                borderRadius: 10,
                borderColor: "#fff",
                borderWidth: 2,
              },
              label: {
                show: false,
                position: "center",
              },
              emphasis: {
                label: {
                  show: true,
                  fontSize: 40,
                  fontWeight: "bold",
                },
              },
              labelLine: {
                show: false,
              },
              data: chartData,
            },
          ],
        }}
        theme="dark"
      />
    </Box>
  );
}
