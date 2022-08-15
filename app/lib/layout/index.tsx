import { Box, Container, Flex, VStack } from "@chakra-ui/react";

import Footer from "./Footer";
import Header from "./Header";

type LayoutProps = {
  children: React.ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
  return (
    <Container maxWidth={'container.md'} mt={5}>
      {/*<Header />*/}
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
