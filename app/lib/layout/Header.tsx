import { Box, Button, Flex, Heading, HStack, Icon, Link, Menu, MenuButton, MenuItem, MenuList, Text, useBreakpointValue } from "@chakra-ui/react";
import { Link as RemixLink } from "@remix-run/react";
import { FiHome, FiList, FiMenu } from "react-icons/fi";

export default function Header() {

  // Update your nav items here
  const navItems = [
    { id: 1, icon: FiHome, title: 'Home', linkto: '/' },
    { id: 2, icon: FiList, title: 'About', linkto: '/about' },
  ]

  const buttonIconMargin = useBreakpointValue({ base: '0', md: '1', lg: '2' })
  const buttonMargin = useBreakpointValue({ base: '0', md: '0', lg: '0' })
  const isMobile = useBreakpointValue({ base: 'none', lg: 'flex' })

  return (
    <Flex as="header" width="full" align="center" justify={'space-between'}>

      <RemixLink to="/">
        <Flex gap={2} align={'center'}>
          <Heading as="h2" size="md" fontWeight={'medium'}>
            Remix Shoegaze Stack
          </Heading>
        </Flex>
      </RemixLink>

      <HStack display="flex" justify={'flex-end'} spacing={1}>
        <HStack
          spacing={1}
          color="brand.500"
          display={{
            base: "none",
            md: "inline-flex",
          }}
        > {navItems.map(({ id, icon, title, linkto }) =>
          <Button key={id} as={RemixLink} to={linkto} variant="ghost">{title}</Button>
        )}
        </HStack>


        <Box display={{ base: 'flex', md: 'none' }}>
          <Menu>
            <MenuButton as={Button} mr={buttonMargin}>
              <Flex>
                <Icon fontSize={'xl'} mt={0} mr={buttonIconMargin} as={FiMenu} />
                <Text display={isMobile}>Menu</Text>
              </Flex>
            </MenuButton>
            <MenuList zIndex={10}>
              {navItems.map((val, index) =>
                <Link
                  as={RemixLink}
                  _hover={{ textDecor: 'none', textColor: "gray.400" }}
                  w={"100%"}
                  prefetch='intent'
                  to={val.linkto}
                  key={index}
                >
                  <MenuItem w="100%">
                    <Icon as={val.icon} mr={3} />
                    {val.title}
                  </MenuItem>
                </Link>)}
            </MenuList>
          </Menu>
        </Box>

      </HStack>
    </Flex >
  );
};
