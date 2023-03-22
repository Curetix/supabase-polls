import { Container, ScaleFade } from "@chakra-ui/react";
import React from "react";

import PollCreationForm from "../components/PollCreationForm";

export default function CreatePoll() {
  return (
    <ScaleFade initialScale={0.9} in>
      <Container centerContent>
        <PollCreationForm />
      </Container>
    </ScaleFade>
  );
}
