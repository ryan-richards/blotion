import { Box, Container, Flex, VStack } from "@chakra-ui/react";

import Footer from "./Footer";
import Header from "./Header";
import Nav from "./Nav";

type LayoutProps = {
  children: React.ReactNode;
  navItems?: any;
  siteData?: any;
};

const Layout = ({ children, navItems,siteData }: LayoutProps) => {
  return (
    <Container maxWidth={'container.md'} mt={5}>
      {navItems ? <Nav data={siteData} navItems={navItems} /> : null}
      <VStack alignItems="stretch" flex={1} w="full" spacing={10}>
        <Box minH={'80vh'}>
          {children}
        </Box>
        <Footer />
      </VStack>
    </Container>
  );
};

export default Layout;
