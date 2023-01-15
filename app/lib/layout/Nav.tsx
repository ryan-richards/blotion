import { Button, Flex, Heading, HStack, Icon, Link, Menu, MenuButton, MenuItem, MenuList, Text, useBreakpointValue } from "@chakra-ui/react";
import { Link as RemixLink } from "@remix-run/react";
import { FiMenu } from "react-icons/fi";
import { slugify } from "../utils/slugify";
import ThemeToggle from "./ThemeToggle";


interface NavProps {
    navItems: NavItemProps[];
    data: any;  
}   

interface NavItemProps {
    slug: string;
    title: string;
}

export default function Nav({ navItems, data }: NavProps) {

    const buttonIconMargin = useBreakpointValue({ base: '0', md: '1', lg: '2' })
    const buttonMargin = useBreakpointValue({ base: '0', md: '0', lg: '0' })
    const isMobile = useBreakpointValue({ base: 'none', lg: 'flex' })
    const isMobileMode = useBreakpointValue({ base: true, lg: false })

    return (
        <Flex direction={'row'} justify={'space-between'} mt={{ base: 2, md: 10 }}>
            <Link as={RemixLink} to={'/'}>
                <Heading size={'lg'} fontWeight={'semibold'}>{data.siteName ? data.siteName : data.site_name}</Heading>
            </Link>
            <HStack gap={1} display={navItems ? 'flex' : 'none'}>
                {navItems.length > 3 || isMobileMode ?
                    <Menu>
                        <MenuButton as={Button} variant={{base:'ghost', md:'link'}} mr={buttonMargin}>
                            <Flex>
                                <Icon fontSize={'xl'} mt={0} mr={buttonIconMargin} as={FiMenu} />
                                <Text display={isMobile}>Menu</Text>
                            </Flex>
                        </MenuButton>
                        <MenuList zIndex={10}>
                            {navItems.map((val: any) =>
                                <Link
                                    as={RemixLink}
                                    _hover={{ textDecor: 'none', textColor: "gray.400" }}
                                    w={"100%"}
                                    prefetch='intent'
                                    to={slugify(val.title)}
                                    key={val.slug}
                                >
                                    <MenuItem w="100%">
                                        {val.title}
                                    </MenuItem>
                                </Link>
                            )}
                        </MenuList>
                    </Menu> :
                    <>
                        {navItems.map((item: any) =>
                            <Link key={item.slug} as={RemixLink} to={slugify(item.title)}>{item.title}</Link>
                        )}
                    </>
                }
                {data.users.plan === 'free' ? null :
                    <ThemeToggle />}
            </HStack>
        </Flex>
    )
}