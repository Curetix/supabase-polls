import { AddIcon } from "@chakra-ui/icons";
import { Button, Flex, Spacer } from "@chakra-ui/react";
import { useLocation, useNavigate } from "react-router-dom";

import ColorModeSwitcher from "./ColorModeSwitcher";

export default function withAction() {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <Flex p={3} as="nav">
      <Button isActive={location.pathname === "/"} variant="outline" onClick={() => navigate("/")}>
        Home
      </Button>
      <Spacer />
      <Button
        isActive={location.pathname === "/create"}
        rightIcon={<AddIcon />}
        variant="outline"
        colorScheme="green"
        onClick={() => navigate("/create")}>
        Create Poll
      </Button>
      <ColorModeSwitcher />
    </Flex>
  );
}
