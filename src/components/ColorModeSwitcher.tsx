import { IconButton, IconButtonProps, useColorMode, useColorModeValue } from "@chakra-ui/react";
import React from "react";
import { FaMoon, FaSun } from "react-icons/fa";

export default function ColorModeSwitcher(props: Omit<IconButtonProps, "aria-label">) {
  const { toggleColorMode } = useColorMode();
  const text = useColorModeValue("dark", "light");
  const SwitchIcon = useColorModeValue(FaMoon, FaSun);

  return (
    <IconButton
      {...props}
      aria-label={`Switch to ${text} mode`}
      variant="outline"
      color="current"
      marginLeft="2"
      onClick={toggleColorMode}
      icon={<SwitchIcon />}
      size="md"
      fontSize="lg"
    />
  );
}
