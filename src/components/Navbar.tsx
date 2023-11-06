import { Button, Flex, Spacer } from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import NextLink from "next/link";
import { usePathname } from "next/navigation";

import ColorModeSwitcher from "./ColorModeSwitcher";

export default function withAction() {
  const pathname = usePathname();
  return (
    <Flex p={3} as="nav">
      <Button as={NextLink} href="/" isActive={pathname === "/"} variant="outline">
        Home
      </Button>
      <Spacer />
      <Button
        as={NextLink}
        href="/new"
        isActive={pathname === "/new"}
        rightIcon={<AddIcon />}
        variant="outline"
        colorScheme="green">
        Create Poll
      </Button>
      <ColorModeSwitcher />
    </Flex>
  );
}
