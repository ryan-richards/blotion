import {
  Button,
  Flex,
  FormLabel,
  Heading,
  Icon,
  Input,
  InputGroup,
  Text,
} from "@chakra-ui/react";
import { FiMail } from "react-icons/fi";

export default function RevueForm({ revue_profile }: any) {
  return (
    <Flex
      p={{ base: 5, md: 10 }}
      direction={"column"}
      gap={2}
      bg={"box"}
      rounded={"md"}
    >
      <Heading fontSize={"lg"} fontWeight={"normal"}>
        Subscribe to my Newsletter
      </Heading>
      <form
        action={`https://www.getrevue.co/profile/${revue_profile}/add_subscriber`}
        method="post"
        id="revue-form"
        name="revue-form"
        target="_blank"
      >
        <InputGroup className="revue-form-group" gap={3}>
          <Input
            className="revue-form-field"
            placeholder="Your email address..."
            type="email"
            name="member[email]"
            id="member_email"
          />
          <Button type={"submit"} name="member[subscribe]" id="member_submit">
            <Icon as={FiMail} display={{ base: "flex", md: "none" }} />
            <Text display={{ base: "none", md: "flex" }}>Subscribe</Text>
          </Button>
        </InputGroup>
        <Text pt={2} fontSize={"sm"}>
          By subscribing, you agree with Revue’s{" "}
          <a target="_blank" href="https://www.getrevue.co/terms">
            Terms of Service
          </a>{" "}
          and{" "}
          <a target="_blank" href="https://www.getrevue.co/privacy">
            Privacy Policy
          </a>
          .
        </Text>
      </form>
    </Flex>
  );
}
