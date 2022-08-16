/* eslint-disable jsx-a11y/no-autofocus */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import {
  useToast,
  VStack,
  HStack,
  Heading,
  Input,
  InputGroup,
  InputRightElement,
  Select,
  Checkbox,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Button,
  IconButton,
} from '@chakra-ui/react';
import { FaPlus, FaMinus } from 'react-icons/fa';
import { addDays } from 'date-fns';
import supabase from '../lib/supabase';
import { CreatePollResponse } from '../lib/types';

type PollForm = {
  title: string;
  options: { value: string }[];
  isUnlisted: boolean;
  allowMultipleChoices: boolean;
  closeAt: string;
};

export default function PollCreationForm() {
  const navigate = useNavigate();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PollForm>({
    defaultValues: {
      options: [{ value: '' }, { value: '' }],
    },
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'options',
  });

  async function createPoll(input: any) {
    setIsLoading(true);
    const { data, error } = await supabase.functions.invoke<CreatePollResponse>(
      'create-poll',
      {
        body: JSON.stringify({
          title: input.title,
          options: input.options.map((o: any) => o.value),
          is_unlisted: input.isUnlisted,
          allow_multiple_answers: input.allowMultipleChoices,
          close_at: input.closeAt,
        }),
      },
    );
    setIsLoading(false);
    if (error !== null || (!data.ok && !data.validation)) {
      toast({
        status: 'error',
        title: 'Error',
        description: error ? error.message : data.message,
        duration: 10000,
        isClosable: true,
      });
    } else if (data && !data.ok && data.validation) {
      // eslint-disable-next-line no-restricted-syntax
      for (const issue of data.validation.issues) {
        toast({
          status: 'error',
          title: 'Error',
          description: issue.message,
          duration: 10000,
          isClosable: true,
        });
      }
    } else {
      toast({
        title: 'Success',
        description: data.message,
        duration: 5000,
        isClosable: true,
      });
      navigate(`/${data.poll!.id}`);
    }
  }

  return (
    <form onSubmit={handleSubmit(createPoll)} noValidate>
      <VStack spacing={4}>
        <Heading
          fontWeight={600}
          fontSize={{ base: '3xl', sm: '4xl', md: '6xl' }}
          mb={10}
        >
          Create a Poll
        </Heading>

        <FormControl isRequired isInvalid={errors.title !== undefined}>
          <FormLabel>Question</FormLabel>
          <Input
            size="lg"
            variant="filled"
            placeholder="What do you want to ask?"
            {...register('title', { required: true })}
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
                    disabled={fields.length <= 2}
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
          disabled={fields.length >= 5}
          rightIcon={<FaPlus />}
          onClick={() => append({ value: '' })}
        >
          Add Option
        </Button>

        <FormControl>
          <FormLabel>Settings</FormLabel>
          <HStack spacing={5}>
            <Checkbox {...register('isUnlisted')}>Unlisted Poll</Checkbox>
            <Checkbox {...register('allowMultipleChoices')}>
              Allow multiple choices
            </Checkbox>
          </HStack>
        </FormControl>

        <FormControl>
          <FormLabel htmlFor="close-at">How long will this poll be open for?</FormLabel>
          <Select id="close-at" {...register('closeAt')}>
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
