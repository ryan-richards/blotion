import { Flex, Tag, Text, Link, Icon, Image } from "@chakra-ui/react";
import { SiNotion } from "react-icons/si";
import blotionLogo from "../../../public/blotion_logo.png";

const Footer = ({ pro }: any) => {
  return (
    <Flex as="footer" justify={"center"} width="full" align="center" pb={10}>
      {pro ? (
        <Tag pt={1} pb={1}>
          <Link href={`https://${pro.site_name}.blotion.com`} isExternal>
            <Flex align={"center"}>
              <Text>{pro.site_name}</Text>
            </Flex>
          </Link>
        </Tag>
      ) : (
        <Tag pt={1} pb={1}>
          <Link href="https://blotion.com" isExternal>
            <Flex align={"center"}>
              <Image src={blotionLogo} w={"22px"} h={"22px"} mr={1}></Image>
              <Text>made with blotion</Text>
            </Flex>
          </Link>
        </Tag>
      )}
    </Flex>
  );
};

export default Footer;
