import { Box, Center, Container, Flex, VStack } from "@chakra-ui/react";

import Footer from "./Footer";
import Nav from "./Nav";

type LayoutProps = {
  children: React.ReactNode;
  navItems?: any;
  siteData?: any;
};

const Layout = ({ children, navItems, siteData }: LayoutProps) => {

  return (
    <Container maxWidth={siteData ? 'container.md' : 'container.lg'} mt={5}>
      {navItems ? <Nav data={siteData} navItems={navItems} /> : null}
      <VStack alignItems="stretch" flex={1} w="full" spacing={10}>
        <Box minH={'80vh'}>
          {children}
        </Box>
        {siteData ? 
        <Footer pro={siteData && siteData.users.plan !== 'pro' ? null : siteData} />  : null}
      </VStack>
    </Container>
  );
};

export default Layout;
