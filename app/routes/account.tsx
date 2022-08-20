import { Avatar, Box, Button, Flex, FormLabel, Heading, Image, Input, Stack, Text, Link, Badge, HStack, Icon, Wrap, WrapItem, Tag, Tooltip, ButtonGroup } from "@chakra-ui/react";
import { ActionFunction, json, LoaderFunction, redirect } from "@remix-run/node";
import { Form, Link as RemixLink, useActionData, useLoaderData, useNavigate, useTransition } from "@remix-run/react";
import { useEffect, useState } from "react";
import { FiEdit, FiPlus, FiRefreshCw, FiSettings } from "react-icons/fi";
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

async function subdomainCheck(str: string) {

    let nameFree

    const { data, error } = await supabaseAdmin
        .from('sites')
        .select('*')
        .match({ site_name: str })
        .single()

    //console.log(data)
    //console.log(error?.message)

    if (data) {
        //console.log('match')
        return nameFree = false
    }

    else if (!data) {
        return nameFree = true
    }
}

export const loader: LoaderFunction = async ({ request }) => {

    const session = await oAuthStrategy.checkSession(request, {
        failureRedirect: "/",
    });

    const url = new URL(request.url);
    const token = url.searchParams.get("token");
    const pageConnected = url.searchParams.get("pageConnected");
    const prompt = url.searchParams.get("prompt");

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

        let pages;

        if (decrypted) {
            const notion = new Client({ auth: decrypted.toString() });

            pages = await notion.search({
                sort: {
                    direction: 'descending',
                    timestamp: 'last_edited_time',
                },
            });


            //put all pages.results id's into an array where page.parent.type is workspace
            const workspaces = pages.results.filter((page: any) => page.parent.type === 'workspace');
            //console.log(workspaces)
            // extract the id's from the workspaces array
            const workspaceIds = workspaces.map((workspace: any) => workspace.id);
            //extract all index_page from the userData.sites array
            const indexPages = userData.sites.map((site: any) => site.index_page);

            // check if workspaces array is the same as the indexPages array
            let result = workspaceIds.every(function (element: any) {
                return indexPages.includes(element);
            });

            //get all workspaces that are not in the indexPages array
            const newWorkspaces = workspaces.filter((workspace: any) => !indexPages.includes(workspace.id));

            if (result) {
                // if they are the same then redirect to the account page you dont need to add more connected pages
                return redirect(`/account`);
            }

            var randomWord = require('random-words');

            newWorkspaces.map(async (page: any) => {
                if (page.parent.type === 'workspace') {
                    //check if name is valid before saving to database
                    let nameValid
                    let name = tidyName(page.properties.title.title[0].plain_text)

                    while (!nameValid) {
                        nameValid = await subdomainCheck(name);
                        //console.log(nameValid)
                        //console.log(name)

                        if (!nameValid) {
                            let word = randomWord()
                            name = [name, word].join('-')
                            //console.log(name)
                        }
                    }

                    const { data, error } = await supabaseAdmin
                        .from('connected_pages')
                        .insert({
                            user: session.user?.id,
                            page_id: page.id,
                            page_name: name,
                            page_cover: page.cover.external.url
                        })
                }
            })

            return redirect(`/account?prompt=true`);
        }
    }


    // if you come to /account page just get userdata and sites 
    const { data: userData } = await supabaseAdmin
        .from('users')
        .select('*, sites(*)')
        .eq('id', session.user?.id)
        .order('created_at', { foreignTable: 'sites', ascending: true })
        .single()

    if (prompt) {
        return json({ userData, prompt })
    }

    return json({ userData });
};


export const action: ActionFunction = async ({ request }) => {

    const session = await oAuthStrategy.checkSession(request, {
        failureRedirect: "/",
    });

    const formData = await request.formData();
    const action = formData.get('action')
    const page = formData.get('page')

    // Get user data
    const { data: userData } = await supabaseAdmin
        .from("users")
        .select("plan")
        .eq('id', session.user?.id)
        .single()

    //if user is on free plan, they can only have one published page
    if (userData.plan === "free") {

        const { data: pages } = await supabaseAdmin
            .from("sites")
            .select("published", { count: 'exact' })
            .eq('published', true)
            .eq('owner', session.user?.id)


        if (!pages) {
            return json({ error: "cant find pages" })
        }

        if (pages.length < 1) {
            if (action === 'pub') {
                const { data } = await supabaseAdmin
                    .from('sites')
                    .update({ published: true })
                    .eq('id', page)
                    .eq('owner', session.user?.id)

                if (data) {
                    return json({ status: 'success page published' });
                }
            }
        }

        if (pages.length == 1) {
            if (action === 'unpub') {
                const { data } = await supabaseAdmin
                    .from('sites')
                    .update({ published: false })
                    .eq('id', page)
                    .eq('owner', session.user?.id)

                if (data) {
                    return json({ status: 'success page unpublished' });
                }
            }
            return json({ error: "You have reached the maximum number of pages you can publish." });
        }




    }
}

export default function Account() {

    const { userData, pages, prompt } = useLoaderData()

    const actionData = useActionData();
    const transition = useTransition();
    const nav = useNavigate();
    const [hover, setHover] = useState('')


    const pagePublishLimit = userData.plan === "free" || userData.plan === "creative" ? 1 : 10
    const pagesPublished = userData.sites.filter((page: { published: any; }) => page.published).length

    const message = actionData ? actionData.encrypted ? actionData.encrypted : actionData.decrypted : '';
    const isSubmitting = transition.state === 'submitting'
    const canManagePlan = userData.plan === "creative" || userData.plan === "pro"
    const canPurchase = userData.plan === "free"

    const redirectURL = canManagePlan ? '/api/create-customer-portal-session' : '/pricing'

    useEffect(() => {
        if (prompt) {
            //console.log('prompt causing reload')
            nav(`/account`)
        }
    }, [prompt])

    return (
        <>
            <Box bg={'box'} width={'full'} mt={10} p={{ base: 2, md: 10 }} rounded={'lg'}>
                <Flex direction={{ base: 'column', md: 'row' }} width={'100%'} justify={'space-between'} gap={2}>
                    <Flex gap={4} bg={'gray.100'} rounded={'md'} p={5} align={'center'} justify={'space-between'} direction={{ base: 'column', md: 'row' }} width={'full'} >
                        <Flex direction={{ base: 'column', md: 'row' }} justify={'space-between'} w={'full'} align={'center'}>
                            <Flex gap={3}>
                                <Avatar name={userData.email} ></Avatar>
                                <Flex direction={'column'}>
                                    <Flex gap={2} align={'center'}>
                                        <Text>{userData.name}</Text>
                                        <Badge minW={'50px'} maxWidth={'70px'} h={'20px'} variant={'subtle'} colorScheme={'purple'} textAlign={'center'} width={'50%'}>{userData.plan}</Badge>
                                    </Flex>
                                    <Text>{userData.email}</Text>
                                </Flex>
                            </Flex>
                            <Flex align={'center'} mt={{ base: 5, md: 0 }} gap={2} direction={{ base: 'row', md: 'row' }}>
                                <Form method={canManagePlan ? 'post' : 'get'} action={redirectURL}>
                                    <Button size={'sm'} minW={'100px'} colorScheme={'blue'} variant={'outline'} type={'submit'}>{canManagePlan ? 'Manage Plan' : 'Upgrade'}</Button>
                                </Form>
                                <Form method={'post'} action={'/auth/logout'}>
                                    <Button size={'sm'} minW={'100px'} colorScheme={'gray'} variant={'outline'} type={'submit'}>Logout</Button>
                                </Form>
                            </Flex>
                        </Flex>
                    </Flex>
                </Flex>

                <Flex mt={5} direction={'column'}>
                    <Flex justify={'flex-start'} width={'100%'} gap={2}>
                        <Flex width={{ base: 'full', md: '85%' }} justify={'flex-start'} bg={'gray.100'} rounded={'md'} pb={1} pt={1} align={'center'} gap={4}>
                            <Tag colorScheme={pagesPublished < 1 ? 'red' : 'green'} h={5} ml={3}>Sites Live {pagesPublished}</Tag>
                        </Flex>
                        <Flex>
                            <ButtonGroup>
                                <Button rounded={'md'} onClick={() => signInWithNotion()}>
                                    <Icon as={FiPlus} mr={{ base: 0, md: 2 }} />
                                    <Text display={{ base: 'none', md: 'flex' }}>Connect New Page</Text>
                                </Button>
                                <Tooltip placement='top' hasArrow label='Sync with Notion Workspace' shouldWrapChildren>
                                    <Button rounded={'md'} onClick={() => nav(`/account?pageConnected=true`)}>
                                        <Icon as={FiRefreshCw} />
                                    </Button>
                                </Tooltip>
                            </ButtonGroup>
                        </Flex>
                    </Flex>
                    <Wrap mt={5}>
                        {userData.sites.map((page: any) =>
                            <WrapItem key={page.id}>
                                <Box position={'relative'} border={'1px'} borderColor={'gray.300'} rounded={'lg'} p={4} maxH={{ base: 'full', md: 250 }} maxWidth={{ base: 'full', md: 322 }} cursor={'pointer'} onClick={() => setHover(page.id)} onMouseEnter={() => setHover(page.id)} onMouseLeave={() => setHover('')}>
                                    <Flex justify={'flex-end'} display={page.published ? 'flex' : 'none'} >
                                        <Tag colorScheme={'green'} position={'absolute'} top={'2%'} right={'2%'} zIndex={100}>{page.published ? 'Live' : null}</Tag>
                                    </Flex>
                                    {hover == page.id ?
                                        <Stack direction={{ base: 'row', md: 'column' }} position={'absolute'} top={'45%'} left={'50%'} transform={'translate(-50%, -50%)'} zIndex={100}>
                                            <Button variant={'outline'} size={'sm'} colorScheme={'blue'} onClick={() => nav(`/settings/${page.id}`)}>Settings</Button>
                                            <Form method='post'>
                                                <Input hidden name='page' value={page.id} readOnly></Input>
                                                <Tooltip display={page.published || pagesPublished < pagePublishLimit ? 'none' : 'flex'} placement="top" hasArrow label='Upgrade to Pro to publish more pages' shouldWrapChildren mb='3'>
                                                    <Button size={'sm'} type={'submit'} name='action' isLoading={isSubmitting} isDisabled={page.published == false && pagesPublished >= pagePublishLimit} value={page.published ? 'unpub' : 'pub'} variant={'outline'} colorScheme={page.published ? 'orange' : 'green'}>{page.published ? 'Unpublish' : 'Publish'}</Button>
                                                </Tooltip>
                                            </Form>
                                        </Stack> : null}
                                    <Stack>
                                        <Stack opacity={hover == page.id ? '50%' : '100%'}>
                                            <Box rounded={'md'} overflow={'hidden'} maxH={{ base: '250px', md: '180px' }}>
                                                <Image minH={'200px'} objectFit={'cover'} src={page.cover ? page.cover : 'https://images.unsplash.com/photo-1554147090-e1221a04a025?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=848&q=80'} />
                                            </Box>
                                        </Stack>
                                        <Flex justify={'center'} bg={'gray.200'} rounded={'md'} pb={1} pt={1}>
                                            <Link href={`https://${page.site_name}.blotion.com?preview=${page.owner}`} isExternal>
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