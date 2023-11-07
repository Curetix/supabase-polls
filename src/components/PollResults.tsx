import { Box, Center, Container, Heading, HStack, Spinner, useToast } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import ECharts from "@/components/ECharts";
import { Poll, VoteCount } from "@/types/common";
import { createClient } from "@/utils/supabase/browser";
import { RealtimeChannel } from "@supabase/supabase-js";

import StatusIndicator from "./StatusIndicator";

type PollResultsProps = {
  poll: Poll;
};

const supabase = createClient();

export default function PollResults({ poll }: PollResultsProps) {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [votes, setVotes] = useState<VoteCount | null>(null);
  const [totalVotes, setTotalVotes] = useState(0);
  const [subscription, setSubscription] = useState<RealtimeChannel | null>(null);
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
  }, []);

  useEffect(() => {
    if (votes !== null && subscription === null && !closed) {
      const channel = supabase.channel("public:votes").on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "votes",
          filter: `poll_id=eq.${poll.id}`,
        },
        (payload) => {
          console.log("Received realtime vote:", payload);
          const vote = payload.new;
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

  useEffect(
    () => () => {
      if (subscription !== null) {
        supabase.removeChannel(subscription);
      }
    },
    [subscription],
  );

  useEffect(() => {
    if (votes === null) return;
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
          <Box paddingTop={1}>
            {subscription !== null && !closed && <StatusIndicator active />}
            {subscription === null && !closed && <StatusIndicator active={false} />}
          </Box>
        </HStack>
      </Center>

      <ECharts
        option={{
          tooltip: {
            trigger: "none",
          },
          legend: {
            top: "5%",
            left: "center",
          },
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
        style={{ background: "none" }}
        theme="dark"
      />
    </Box>
  );
}
