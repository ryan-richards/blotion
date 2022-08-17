import { Box, Flex, Icon, chakra, useColorModeValue, useToken, Badge, Stack, Text, Link, SimpleGrid, Button } from "@chakra-ui/react";
import { json, LoaderFunction } from "@remix-run/node";
import { Form, useLoaderData, useNavigate } from "@remix-run/react";
import { useState } from "react";
import { FiArrowLeft } from "react-icons/fi";
import { oAuthStrategy } from "~/lib/storage/auth.server";
import { supabaseDB } from "~/lib/storage/db.access";

export const loader: LoaderFunction = async ({ request }) => {

    const session = await oAuthStrategy.checkSession(request, {
        failureRedirect: "/",
    });

    if (!session) {
        return json({ status: 'not-logged-in' });
    }

    const { data: userData } = await supabaseDB
        .from("users")
        .select("plan")
        .eq('id', session.user?.id)
        .single()

    if (userData.plan === 'free') {
        return json({ status: 'free' });
    } else {
        return json({ status: userData.plan });
    }
};


export default function Pricing() {

    const { status } = useLoaderData()

    const [frequency, setFrequency] = useState("month");
    const nav = useNavigate()

    const canPurchase = status === "free" || status === "not-logged-in"
    const canManage = status === "creative" || status === 'pro'
    const canDowngrade = status === "pro"

    const redirectURL = canManage ? `/api/create-customer-portal-session` : `/api/create-checkout-session?plan=pro_${frequency}`

    const Feature = (props: any) => {
        return (
            <Flex align="center">
                <Flex shrink={0}>
                    <Icon
                        boxSize={5}
                        mt={1}
                        mr={2}
                        color="gray.500"
                        _dark={{
                            color: "gray.300",
                        }}
                        viewBox="0 0 20 20"
                        fill="currentColor"
                    >
                        <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                        ></path>
                    </Icon>
                </Flex>
                <Box ml={4}>
                    <chakra.span
                        mt={2}
                        color="gray.700"
                        _dark={{
                            color: "gray.400",
                        }}
                    >
                        {props.children}
                    </chakra.span>
                </Box>
            </Flex>
        );
    };

    return (
        <Box
            mt={{base:0, md:30}}
            py={{base:"34px",md:'64px'}}
            px="10"
        >
            <Flex justify={'flex-start'} mb={3} display={status != 'not-logged-in' ? 'flex' : 'none'}>
                <Button onClick={() => nav('/account')}>
                    <Icon as={FiArrowLeft} mr={3}></Icon>
                    Account
                </Button>
            </Flex>
            <Box w="full" px={{ base: 10, md: 4 }} mx="auto" textAlign="center">
                <Text mb={2} fontSize="5xl" fontWeight="bold" lineHeight="tight">
                    Plans + Pricing
                </Text>
                <chakra.p
                    mb={6}
                    fontSize={{ base: 'lg', md: 'xl' }}
                    color="gray.600"
                    _dark={{
                        color: "gray.400",
                    }}
                >
                    Ready to build more sites and connect custom domains?
                </chakra.p>
                <Flex justify="center" mx={{ base: 'auto', md: 0 }} mb={-2}>
                    <Stack
                        direction="row"
                        justify="space-between"
                        p="2"
                        textAlign="center"
                        rounded="md"
                        border={'2px solid'}
                        borderColor="gray.200"
                    >
                        <Button
                            rounded={'lg'}
                            colorScheme="gray"
                            variant={frequency === "month" ? "solid" : "ghost"}
                            onClick={() => setFrequency("month")}
                            px={6}
                        >
                            Bill Monthly
                        </Button>
                        <Button
                            rounded={'lg'}
                            colorScheme="gray"
                            variant={frequency === "year" ? "solid" : "ghost"}
                            onClick={() => setFrequency("year")}
                            px={6}
                        >
                            Bill Yearly
                        </Button>
                    </Stack>
                </Flex>
            </Box>
            <Box maxW="7xl" py="20" mx="auto">
                <SimpleGrid columns={{ base: 1, md: 2 }} gap={{ base: 16, md: 8 }}>
                    <Box
                        rounded={{ base: 'none', md: 'lg' }}
                        shadow={'shadow'}
                        bg="white"
                        _dark={{
                            bg: "gray.800",
                        }}
                    >
                        <Flex
                            direction="column"
                            justify="space-between"
                            p="6"
                            borderBottomWidth="1px"
                            color="gray.200"
                            _dark={{
                                color: "gray.600",
                            }}
                        >
                            <chakra.p
                                mb={1}
                                fontSize="lg"
                                fontWeight="semibold"
                                color="gray.700"
                                _dark={{
                                    color: "gray.400",
                                }}
                            >
                                Creative
                            </chakra.p>
                            <Text
                                mb={2}
                                fontSize="5xl"
                                fontWeight={{ base: 'bold', md: 'extrabold' }}
                                color="gray.900"
                                _dark={{
                                    color: "gray.50",
                                }}
                                lineHeight="tight"
                            >
                                £{frequency === "month" ? 5 : 50}
                                <chakra.span
                                    fontSize="2xl"
                                    fontWeight="medium"
                                    color="gray.600"
                                    _dark={{
                                        color: "gray.400",
                                    }}
                                >
                                    {" "}
                                    /{frequency}
                                </chakra.span>
                            </Text>
                            <Form action={canPurchase ? `/api/create-checkout-session?plan=creative_${frequency}` : '/api/create-customer-portal-session'} method="post">
                                <Button
                                    type={'submit'}
                                    w={{ base: 'full', md: 'full' }}
                                    display="inline-flex"
                                    alignItems="center"
                                    justifyContent="center"
                                    border="solid transparent"
                                    fontWeight="bold"
                                    rounded="md"
                                    shadow="shadow"
                                    _light={{
                                        color: "gray.800",
                                    }}
                                    bg="gray.100"
                                    _dark={{
                                        bg: "gray.500",
                                    }}
                                    _hover={{
                                        bg: "gray.200",
                                        _dark: {
                                            bg: "gray.100",
                                        },
                                    }}
                                >
                                    {canPurchase ? 'Purchase' : null}
                                    {canDowngrade ? 'Manage Plan' : null}
                                </Button>
                            </Form>
                        </Flex>
                        <Stack direction="column" p="6" spacing="3" flexGrow="1">
                            <Feature>1 Published Blog</Feature>
                            <Feature>Add a Custom Domain</Feature>
                            <Feature>Dark / Light Toggle</Feature>
                        </Stack>
                    </Box>

                    <Box
                        rounded={{ base: 'none', md: 'lg' }}
                        shadow={'shadow'}
                        bg="white"
                        _dark={{
                            bg: "gray.800",
                        }}
                    >
                        <Flex
                            direction="column"
                            justify="space-between"
                            p="6"
                            borderBottomWidth="1px"
                            color="gray.200"
                            _dark={{
                                color: "gray.600",
                            }}
                        >
                            <chakra.p
                                mb={1}
                                fontSize="lg"
                                fontWeight="semibold"
                                color="gray.700"
                                _dark={{
                                    color: "gray.400",
                                }}
                            >
                                Pro
                            </chakra.p>
                            <Text
                                mb={2}
                                fontSize="5xl"
                                fontWeight={{ base: 'bold', md: 'extrabold' }}
                                color="gray.900"
                                _dark={{
                                    color: "gray.50",
                                }}
                                lineHeight="tight"
                            >
                                £{frequency === "month" ? 10 : 100}
                                <chakra.span
                                    fontSize="2xl"
                                    fontWeight="medium"
                                    color="gray.600"
                                    _dark={{
                                        color: "gray.400",
                                    }}
                                >
                                    {" "}
                                    /{frequency}
                                </chakra.span>
                            </Text>
                            <Form action={redirectURL} method="post">
                                <Button
                                    type={'submit'}
                                    w={{ base: 'full', md: 'full' }}
                                    display="inline-flex"
                                    alignItems="center"
                                    justifyContent="center"
                                    px={5}
                                    py={3}
                                    border="solid transparent"
                                    fontWeight="bold"
                                    rounded="md"
                                    shadow="shadow"
                                    _light={{
                                        color: "white",
                                    }}
                                    bg="gray.600"
                                    _dark={{
                                        bg: "gray.600",
                                    }}
                                    _hover={{
                                        bg: "gray.700",
                                        _dark: {
                                            bg: "gray.700",
                                        },
                                    }}
                                >
                                    {canPurchase ? 'Purchase' : null}
                                    {canManage && !canDowngrade ? 'Upgrade' : null}
                                    {canDowngrade ? 'Manage Plan' : null}
                                </Button>
                            </Form>
                        </Flex>
                        <Stack direction="column" p="6" spacing="3" flexGrow="1">
                            <Feature>50 Published Blogs</Feature>
                            <Feature>Add Custom Domains</Feature>
                            <Feature>Remove blotion branding</Feature>
                            <Feature>Dark / Light Toggle</Feature>
                        </Stack>
                    </Box>
                </SimpleGrid>
            </Box>
        </Box>
    );
};