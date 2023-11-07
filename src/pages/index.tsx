import { Alert, Button, Heading, ScaleFade, VStack } from "@chakra-ui/react";
import { FaChevronRight } from "react-icons/fa";
import { Poll } from "@/types/common";
import { Database } from "@/types/database";
import { createPagesServerClient } from "@supabase/auth-helpers-nextjs";
import { GetServerSideProps } from "next";
import NextLink from "next/link";

type HomePageProps = {
  polls: Poll[];
};

export const getServerSideProps: GetServerSideProps<HomePageProps> = async (context) => {
  const supabase = createPagesServerClient<Database>(context);
  const { data: polls, error } = await supabase
    .from("polls")
    .select("*")
    .eq("is_unlisted", false)
    .order("created_at", { ascending: false })
    .limit(5);

  if (!polls || error) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      polls,
    },
  };
};

export default function HomePage({ polls }: HomePageProps) {
  return (
    <ScaleFade initialScale={0.9} in>
      <VStack spacing={10}>
        <Heading fontSize={{ base: "3xl", sm: "4xl", lg: "5xl" }}>Latest Polls</Heading>

        {polls !== null && polls.length > 0 && (
          <VStack spacing={4}>
            {polls?.map((p) => (
              <Button
                as={NextLink}
                href={`/${p.id}`}
                key={p.id}
                colorScheme="blue"
                variant="outline"
                rightIcon={<FaChevronRight />}>
                {p.title}
              </Button>
            ))}
          </VStack>
        )}

        {polls !== null && polls.length === 0 && <Alert status="info">No polls found.</Alert>}
        {polls === null && <Alert status="error">Oops, could not load latest polls.</Alert>}

        <Button as={NextLink} href="/new" size="lg" colorScheme="green">
          Create your own Poll
        </Button>
      </VStack>
    </ScaleFade>
  );
}
