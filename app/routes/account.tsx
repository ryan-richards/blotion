import { Avatar, Box, Button, Flex, FormLabel, Heading, Image, Input, Stack, Text, Link, Badge, HStack, Icon, Wrap, WrapItem, Tag, Tooltip } from "@chakra-ui/react";
import { ActionFunction, json, LoaderFunction, redirect } from "@remix-run/node";
import { Form, Link as RemixLink, useActionData, useLoaderData, useNavigate, useTransition } from "@remix-run/react";
import { useState } from "react";
import { FiEdit, FiPlus } from "react-icons/fi";
import { Stat } from "~/lib/components/Stat";
import { oAuthStrategy } from "~/lib/storage/auth.server";
import { createSite } from "~/lib/storage/post.server";
import { signInWithNotion } from "~/lib/storage/supabase.client";
import { supabaseAdmin } from "~/lib/storage/supabase.server";
import { decryptAPIKey, encryptAPIKey } from "~/lib/utils/encrypt-api-key";


//function regex to remove special characters and convert to lowercase
function tidyName(str: string) {
    return str.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
}

//regex function remove special characters spaces and convert to lowercase
function tidySlug(str: string) {
    return str.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
}

export const loader: LoaderFunction = async ({ request }) => {

    const session = await oAuthStrategy.checkSession(request, {
        failureRedirect: "/",
    });

    const url = new URL(request.url);
    const token = url.searchParams.get("token");
    const pageConnected = url.searchParams.get("pageConnected");

    if (token) {
        const { data, error } = await supabaseAdmin
            .from('users')
            .update({ notion_token: token })
            .eq('id', session.user?.id)

        if (data) {
            return redirect(`/account?pageConnected=true`);
        }

        if (error) {
            return json({
                status: 'error',
                message: error.message,
            });
        }
    }

    if (pageConnected) {

        const { data: userData } = await supabaseAdmin
            .from('users')
            .select('*, sites(*)')
            .eq('id', session.user?.id)
            .single()

        const decrypted = await decryptAPIKey(userData.notion_token.toString());

        const { Client } = require('@notionhq/client');

        let pages

        if (decrypted) {
            const notion = new Client({ auth: decrypted.toString() });

            pages = await notion.search({
                sort: {
                    direction: 'descending',
                    timestamp: 'last_edited_time',
                },
            });

            pages.results.map(async (page: any) => {

                if (page.parent.type === 'workspace') {
                    const { data } = await supabaseAdmin
                        .from('connected_pages')
                        .insert({
                            user: session.user?.id,
                            page_id: page.id,
                            page_name: tidyName(page.properties.title.title[0].plain_text),
                            page_cover: page.cover.external.url
                        })

                    if (data) {
                        const { data: userData } = await supabaseAdmin
                            .from('users')
                            .select('*, sites(*)')
                            .eq('id', session.user?.id)
                            .single()

                        return json({ userData })
                    }
                }
            })
        }
    }

    const { data: userData } = await supabaseAdmin
        .from('users')
        .select('*, sites(*)')
        .eq('id', session.user?.id)
        .single()


    return json({ userData });
};


export const action: ActionFunction = async ({ request }) => {

    const session = await oAuthStrategy.checkSession(request, {
        failureRedirect: "/",
    });

    const formData = await request.formData();
    const site_name = formData?.get('site');
    const index_id = formData?.get('index');

    const siteDetails = {
        owner: session.user?.id,
        site_name: site_name,
        index_id: index_id,
    }

    const { data } = await createSite(siteDetails)

    console.log(data)

    return json({ status: 'success' });
};

export default function Account() {

    const { userData, pages } = useLoaderData()

    const actionData = useActionData();
    const transition = useTransition();
    const nav = useNavigate();

    const [hashed, setHashed] = useState('');
    const [secret, setSecret] = useState('');
    const [hover, setHover] = useState('')

    const message = actionData ? actionData.encrypted ? actionData.encrypted : actionData.decrypted : '';
    const isSubmitting = transition.state === 'submitting'


    return (
        <>
            <Box bg={'box'} width={'full'} mt={10} p={{ base: 2, md: 10 }} rounded={'lg'}>
                <Flex direction={{ base: 'column', md: 'row' }} width={'100%'} justify={'space-between'} gap={2}>
                    <Flex gap={4} bg={'gray.100'} rounded={'md'} p={5} align={'center'} justify={'space-between'} direction={{ base: 'column', md: 'row' }} width={'full'} >
                        <Flex direction={{ base: 'row', md: 'row' }} justify={'space-between'} w={'full'}>
                            <Flex gap={3}>
                                <Avatar name={userData.email} ></Avatar>
                                <Flex direction={'column'}>
                                    <Text>{userData.name}</Text>
                                    <Text>{userData.email}</Text>
                                </Flex>
                            </Flex>
                        </Flex>
                    </Flex>

                    <Flex bg={'gray.100'} rounded={'md'} p={5} align={'center'} justify={'center'} width={'full'}>
                        <HStack gap={5} justify={'space-between'} w={'full'} pl={3} pr={3}>
                            <Stat label={'Published'} value={'1'} limit={' / ' + '1'} />
                            <Stat label={'Total Pages'} value={'1'} limit={' / ' + '25'} />
                            <Stat label={'Combined Views'} value={''} limit={'495'} />
                        </HStack>
                    </Flex>
                </Flex>

                <Flex mt={5} direction={'column'}>
                    <Flex justify={'flex-start'} width={'100%'} gap={2}>
                        <Flex width={'85%'} justify={'flex-start'} bg={'gray.100'} rounded={'md'} pb={1} pt={2}>
                            <Text ml={5}>Sites</Text>
                        </Flex>
                        <Flex>
                            <Button rounded={'md'} onClick={() => signInWithNotion()}>
                                <Icon as={FiPlus} mr={{ base: 0, md: 2 }} />
                                <Text display={{ base: 'none', md: 'flex' }}>Connect New Page</Text>
                            </Button>
                        </Flex>
                    </Flex>
                    <Wrap mt={5}>
                        {userData.sites.map((page: any) =>
                            <WrapItem key={page.id}>
                                <Box position={'relative'} bg={hover == page.id ? 'gray.200' : 'gray.100'} border={'1px'} borderColor={'gray.300'} rounded={'lg'} p={4} maxH={{ base: 'full', md: 250 }} maxWidth={{ base: 'full', md: 322 }} cursor={'pointer'}>
                                    <Flex justify={'flex-end'} display={page.published ? 'flex' : 'none'} >
                                        <Tag colorScheme={'green'} position={'absolute'} top={'2%'} right={'2%'} zIndex={100}>{page.published ? 'Live' : null}</Tag>
                                    </Flex>
                                    <Stack>
                                        <Box rounded={'md'} overflow={'hidden'} maxH={{base:'250px',md:'180px'}}>
                                            <Image  src={page.cover ? page.cover : 'https://images.unsplash.com/photo-1554147090-e1221a04a025?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=848&q=80'} />
                                        </Box>
                                        <Flex justify={'center'} bg={'gray.200'} rounded={'md'} pb={1} pt={1}>
                                            <Link href={`https://${page.site_name}.blotion.com`} isExternal>
                                                <Text key={page.id}>https://{page.site_name}.blotion.com</Text>
                                            </Link>
                                        </Flex>
                                    </Stack>
                                </Box>
                            </WrapItem>
                        )}
                    </Wrap>
                </Flex>
            </Box>
        </>
    )
}