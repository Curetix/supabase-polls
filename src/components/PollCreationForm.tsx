import {
  Button,
  Checkbox,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  HStack,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  Select,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { FaMinus, FaPlus } from "react-icons/fa";
import { ApiResponse, Poll } from "@/types/common";
import { fetcher } from "@/utils/fetcher";
import { addDays } from "date-fns";
import { useRouter } from "next/navigation";

type PollForm = {
  title: string;
  options: { value: string }[];
  isUnlisted: boolean;
  allowMultipleChoices: boolean;
  closeAt: string;
};

export default function PollCreationForm() {
  const router = useRouter();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PollForm>({
    defaultValues: {
      options: [{ value: "" }, { value: "" }],
    },
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "options",
  });

  async function createPoll(input: any) {
    setIsLoading(true);
    const response = await fetcher<ApiResponse<Poll>>(
      "/api/polls",
      {
        method: "POST",
        body: JSON.stringify({
          title: input.title,
          options: input.options.map((o: any) => o.value),
          is_unlisted: input.isUnlisted,
          allow_multiple_answers: input.allowMultipleChoices,
          close_at: input.closeAt,
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
      return;
    } else {
      toast({
        title: "Success",
        description: response.message,
        duration: 5000,
        isClosable: true,
      });
      router.push(`/${response.data.id}`);
    }
  }

  return (
    <form style={{ width: "100%" }} onSubmit={handleSubmit(createPoll)} noValidate>
      <VStack spacing={4}>
        <Heading fontSize={{ base: "3xl", sm: "4xl", md: "5xl" }}>Create a Poll</Heading>

        <FormControl isRequired isInvalid={errors.title !== undefined}>
          <FormLabel>Question</FormLabel>
          <Input
            size="lg"
            variant="filled"
            placeholder="What do you want to ask?"
            {...register("title", { required: true })}
          />
          {errors.title && <FormErrorMessage>Please enter a question.</FormErrorMessage>}
        </FormControl>

        <FormControl isRequired isInvalid={errors.options !== undefined}>
          <FormLabel>Choices</FormLabel>
          <VStack spacing={2}>
            {fields.map((field, index) => (
              <InputGroup key={field.id}>
                <Input
                  placeholder={`Vote option ${index + 1}`}
                  isInvalid={errors.options && errors.options[index] !== undefined}
                  {...register(`options.${index}.value` as const, { required: true })}
                />
                <InputRightElement>
                  <IconButton
                    size="sm"
                    variant="ghost"
                    colorScheme="red"
                    aria-label="Remove option"
                    icon={<FaMinus />}
                    isDisabled={fields.length <= 2}
                    onClick={() => remove(index)}
                  />
                </InputRightElement>
              </InputGroup>
            ))}
          </VStack>
          {errors.options && (
            <FormErrorMessage>At least one of the choices is invalid.</FormErrorMessage>
          )}
        </FormControl>

        <Button
          isDisabled={fields.length >= 5}
          rightIcon={<FaPlus />}
          onClick={() => append({ value: "" })}>
          Add Option
        </Button>

        <FormControl>
          <FormLabel>Settings</FormLabel>
          <HStack spacing={5}>
            <Checkbox {...register("isUnlisted")}>Unlisted Poll</Checkbox>
            <Checkbox {...register("allowMultipleChoices")}>Allow multiple choices</Checkbox>
          </HStack>
        </FormControl>

        <FormControl>
          <FormLabel htmlFor="close-at">How long will this poll be open for?</FormLabel>
          <Select id="close-at" {...register("closeAt")}>
            <option value={addDays(new Date(), 1).toISOString()}>1 day (default)</option>
            <option value={addDays(new Date(), 7).toISOString()}>1 week</option>
            <option value={addDays(new Date(), 30).toISOString()}>1 month</option>
          </Select>
        </FormControl>

        <Button size="lg" colorScheme="green" isLoading={isLoading} type="submit">
          Create Poll
        </Button>
      </VStack>
    </form>
  );
}
