import { Box, Container, Flex, VStack } from "@chakra-ui/react";

import Footer from "./Footer";
import Header from "./Header";
import HomeFooter from "./HomeFooter";
import Nav from "./Nav";

type LayoutProps = {
  children: React.ReactNode;
  navItems?: any;
  siteData?: any;
};

const Layout = ({ children, navItems, siteData }: LayoutProps) => {

  return (
    <Container maxWidth={'container.md'} mt={5}>
      {navItems ? <Nav data={siteData} navItems={navItems} /> : null}
      <VStack alignItems="stretch" flex={1} w="full" spacing={10}>
        <Box minH={'80vh'}>
          {children}
        </Box>
        {siteData && siteData.users.plan !== 'pro' ? <Footer /> : null}
      </VStack>
    </Container>
  );
};

export default Layout;
