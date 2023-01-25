import {
  Stack,
  Heading,
  Flex,
  Icon,
  Button,
} from "@chakra-ui/react";
import { SiNotion } from "react-icons/si";
import { signInWithNotion } from "~/lib/storage/supabase.client";

export default function Login() {
  return (
    <Stack gap={10} mt={20}>
      <Stack>
        <Flex direction={"column"} align={"center"} gap={3}>
          <Flex direction={"column"} justify={"center"} align={"center"}>
            <Flex direction={"column"} align={"center"} gap={2}>
              <Heading
                fontWeight={"semibold"}
                textAlign={"center"}
                size={"2xl"}
              >
                Create a Free Account
              </Heading>
              <Heading
                fontWeight={"normal"}
                mt={2}
                maxW={"62%"}
                textAlign={"center"}
                size={"md"}
              >
                You can get started with Blotion by creating a free account! All
                you need to do is Login with Notion.
              </Heading>
              <Flex
                w={"full"}
                align={"center"}
                direction={{ base: "column", md: "row" }}
                justify={"center"}
                gap={2}
                mt={10}
              >
                <Button
                  size={"lg"}
                  minW={200}
                  variant={"outline"}
                  className={"button block"}
                  onClick={() => signInWithNotion()}
                >
                  <Icon as={SiNotion} fontSize="xl" mr={2}></Icon>
                  <span>Login with Notion</span>
                </Button>
              </Flex>
            </Flex>
          </Flex>
        </Flex>
      </Stack>
    </Stack>
  );
}
