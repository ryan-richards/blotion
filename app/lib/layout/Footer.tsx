import { Flex,Tag,Text, Link, Icon } from "@chakra-ui/react";
import { SiNotion } from "react-icons/si";

const Footer = () => {
  return (
    <Flex as="footer" justify={'center'} width="full" align="center" pb={10}>
      <Tag>
        <Link href="https://blotion.com" isExternal>
          <Flex align={'center'}>
            <Icon as={SiNotion} mr={2} />
            <Text>
              made with blotion
            </Text>
          </Flex>
        </Link>
      </Tag>
    </Flex>
  );
};

export default Footer;
