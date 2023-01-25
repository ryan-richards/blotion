import {
  Box,
  Heading,
  Stack,
  Text,
  useBreakpointValue,
  useColorModeValue,
} from "@chakra-ui/react";
import * as React from "react";

interface Props {
  label: string;
  value: string;
  limit: string;
}
export const Stat = (props: Props) => {
  const { label, value, limit } = props;
  return (
    <Stack>
      <Text fontSize="md" color="muted">
        {label}
      </Text>
      <Heading size={useBreakpointValue({ base: "sm", md: "sm" })}>
        {value}
        {limit}
      </Heading>
    </Stack>
  );
};
