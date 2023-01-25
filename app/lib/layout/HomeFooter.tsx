import {
  Flex,
  Tag,
  Text,
  Link,
  Icon,
  Image,
  Heading,
  Stack,
  Divider,
  HStack,
  IconButton,
  Grid,
  GridItem,
} from "@chakra-ui/react";
import { SiTwitter } from "react-icons/si";
const HomeFooter = () => {
  return (
    <Flex justify={"center"}>
      <Flex as="footer" width={"full"} maxW={"container.lg"} minH={200}>
        <Flex justify={"center"} width="full" direction={"column"}>
          <Divider></Divider>
          <Grid
            p={10}
            templateColumns={{ base: "repeat(2,1fr)", md: "repeat(4, 1fr)" }}
            gap={6}
            display={"none"}
          >
            <GridItem w="100%">
              <Stack>
                <Heading fontSize={"md"}>INTEGRATIONS</Heading>
              </Stack>
            </GridItem>
            <GridItem w="100%">
              <Stack>
                <Heading fontSize={"md"}>SUPPORT</Heading>
                <Link>Pricing</Link>
                <Link>FAQ</Link>
              </Stack>
            </GridItem>
            <GridItem w="100%">
              <Stack>
                <Heading fontSize={"md"}>GUIDES</Heading>
                <Link>Quick Start</Link>
                <Link>Blotion Limitations</Link>
                <Link>Writing Posts</Link>
              </Stack>
            </GridItem>
            <GridItem w="100%">
              <Stack>
                <Heading fontSize={"md"}>LEGAL</Heading>
                <Link>Privacy Policy</Link>
                <Link>Terms</Link>
              </Stack>
            </GridItem>
          </Grid>
          <Divider></Divider>
          <Flex justify={"space-between"} p={10}>
            <Text>© 2023 Blotion. All rights reserved.</Text>
            <HStack>
              <IconButton
                as={Link}
                href={"https://twitter.com/ryan_blotion"}
                isExternal
                aria-label={"Twitter Icon"}
                variant={"link"}
                icon={<Icon as={SiTwitter} />}
              ></IconButton>
            </HStack>
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default HomeFooter;
