import {
  Button,
  Checkbox,
  CheckboxGroup,
  Heading,
  Radio,
  RadioGroup,
  Stack,
  useToast,
  VStack,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { ApiResponse, Poll, Vote } from "@/types/common";
import { fetcher } from "@/utils/fetcher";
import { votedPollsAtom } from "@/utils/state.ts";
import { useAtom } from "jotai/index";

type Props = {
  poll: Poll;
};

export default function PollVoteForm({ poll }: Props) {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState("");
  const [selectedOptions, setSelectedOptions] = useState<(string | number)[]>([]);
  const [colors] = useState(["red", "green", "orange", "blue", "purple"]);
  const [votedPolls, setVotedPolls] = useAtom(votedPollsAtom);

  async function castVote() {
    setIsLoading(true);
    const response = await fetcher<ApiResponse<Vote>>(
      "/api/votes",
      {
        method: "POST",
        body: JSON.stringify({
          pollId: poll.id,
          voteOption: poll.allow_multiple_answers ? selectedOptions : selectedOption,
        }),
      },
      false,
    );
    setIsLoading(false);
    if (!response.success || !response.data) {
      toast({
        status: "error",
        title: "Error",
        description: response.details || response.error || "Something went wrong.",
        duration: 10000,
        isClosable: true,
      });
    } else {
      toast({
        title: "Success",
        description: response.message,
        duration: 5000,
        isClosable: true,
      });
      setVotedPolls([...votedPolls, poll.id]);
    }
  }

  return (
    <VStack spacing={5}>
      <Heading size="lg">Cast your Vote</Heading>
      {poll.allow_multiple_answers ? (
        <CheckboxGroup onChange={setSelectedOptions}>
          <Stack>
            {poll.options.map((option, index) => (
              <Checkbox colorScheme={colors[index]} size="lg" key={option} value={option}>
                {option}
              </Checkbox>
            ))}
          </Stack>
        </CheckboxGroup>
      ) : (
        <RadioGroup onChange={setSelectedOption}>
          <Stack>
            {poll.options.map((option, index) => (
              <Radio colorScheme={colors[index]} size="lg" key={option} value={option}>
                {option}
              </Radio>
            ))}
          </Stack>
        </RadioGroup>
      )}

      <Button
        size="lg"
        colorScheme="green"
        onClick={() => castVote()}
        isLoading={isLoading}
        disabled={selectedOption === "" && selectedOptions.length === 0}>
        Vote
      </Button>
    </VStack>
  );
}
