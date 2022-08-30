import { Box, Button, Flex, Heading, HStack, Icon, Link, Menu, MenuButton, MenuItem, MenuList, Text, useBreakpointValue } from "@chakra-ui/react";
import { Link as RemixLink } from "@remix-run/react";
import { FiDollarSign, FiHome, FiList, FiMenu, FiUser } from "react-icons/fi";
import { SiNotion } from "react-icons/si";
import { signInWithNotion } from "../storage/supabase.client";

export default function Header({ session }: any) {
  // Update your nav items here
  const navItems = [
    { id: 1, icon: FiHome, title: 'Home', linkto: '/' },
    { id: 2, icon: FiDollarSign, title: 'Pricing', linkto: '/pricing' },
  ]

  const buttonIconMargin = useBreakpointValue({ base: '0', md: '1', lg: '2' })
  const buttonMargin = useBreakpointValue({ base: '0', md: '0', lg: '0' })
  const isMobile = useBreakpointValue({ base: 'none', lg: 'flex' })

  return (
    <Flex justify={'center'} mt={{base:5,md:10}} pl={5} pr={5}>
      <Flex as="header" width="full" align="center" justify={'space-between'} maxW={'container.lg'}>
        <RemixLink to="/">
          <Flex gap={2} align={'center'}>
            <Heading size="md" fontWeight={'semibold'}>
              Blotion
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
            <Button key={id} as={RemixLink} to={linkto} variant={'ghost'}>{title}</Button>
          )}
            {session ? <Button as={RemixLink} to={'/account'} variant={'solid'}>Account</Button> : null}
            <Button
              display={!session ? 'flex' : 'none'}
              variant={'outline'}
              className={'button block'}
              onClick={() => signInWithNotion()}
            >
              <Icon as={SiNotion} fontSize='xl' mr={2}></Icon>
              <span>Login with Notion</span>
            </Button>
          </HStack>


          <Box display={{ base: 'flex', md: 'none' }}>
            <Menu>
              <MenuButton as={Button} mr={buttonMargin}>
                <Flex>
                  <Icon fontSize={'xl'} mt={0} mr={buttonIconMargin} as={FiMenu} />
                  <Text display={isMobile}>Menu</Text>
                </Flex>
              </MenuButton>
              <MenuList zIndex={200}>
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
                {session ? <Link
                  as={RemixLink}
                  _hover={{ textDecor: 'none', textColor: "gray.400" }}
                  w={"100%"}
                  prefetch='intent'
                  to={'/account'}
                >
                  <MenuItem w="100%">
                    <Icon as={FiUser} mr={3} />
                    Account
                  </MenuItem>
                </Link> : null}
                <Link
                    as={Text}
                    variant={'link'}
                    _hover={{ textDecor: 'none', textColor: "gray.400" }}
                    w={"100%"}
                    prefetch='intent'
                    onClick={() => signInWithNotion()}
                  >
                    <MenuItem w="100%">
                      <Icon as={SiNotion} mr={3} />
                      Login
                    </MenuItem>
                  </Link>
              </MenuList>
            </Menu>
          </Box>

        </HStack>
      </Flex >
    </Flex >

  );
};
