import { Box, Flex, Image, Stack, Tag, Text, Link, FormLabel, Input, InputGroup, Button } from "@chakra-ui/react";
import { ActionFunction, json, LoaderFunction } from "@remix-run/node";
import { Form, useActionData, useFetcher, useLoaderData, useTransition } from "@remix-run/react";
import { Link as RemixLink } from "react-router-dom";
import { oAuthStrategy } from "~/lib/storage/auth.server";
import { supabaseAdmin } from "~/lib/storage/supabase.server";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, } from "react";


export const loader: LoaderFunction = async ({ request, params }) => {

    const session = await oAuthStrategy.checkSession(request, {
        failureRedirect: "/",
    });

    const page = params.page;
    console.log(page)

    if (!page) {
        return json({
            status: 'error',
            message: 'No page specified',
        });
    }

    const { data: siteData } = await supabaseAdmin
        .from('sites')
        .select('*')
        .eq('id', page)
        .eq('owner', session.user?.id)
        .single()

    console.log(siteData)

    if (!siteData) {
        return json({
            status: 'error',
            message: 'Page not found',
        });
    }

    return json({ siteData });
};


export const action: ActionFunction = async ({ request, params }) => {

    const session = await oAuthStrategy.checkSession(request, {
        failureRedirect: "/",
    });

    const formData = await request.formData();
    const siteName = formData.get('site_name');

    if (!siteName) {
        return json({
            status: 'error',
            message: 'No site name specified',
        });
    }

    const { data, error } = await supabaseAdmin
        .from('sites')
        .update({ site_name: siteName })
        .eq('owner', session.user?.id)
        .eq('id', params.page)

    if (error) {
        return json({
            status: 'error',
            message: error.message,
        });
    }

    return json({ status: 'success' });
};


export default function Settings() {

    const { siteData: page } = useLoaderData()
    const [subdomain, setSubdomain] = useState(page.site_name)
    const nav = useNavigate();

    const actionData = useActionData();
    const siteNameAvailable = useFetcher()
    let [siteNameValid, setSiteNameValid] = useState(false)
    let [nameCheckCount, setNameCheckCount] = useState(0)
    let [input, setInput] = useState(page.site_name)
    let [inputError, setInputError] = useState('')
    const transition = useTransition();

    const isSubmitting = transition.state === 'submitting'
    let isSaved = actionData ? actionData.status === 'success' : false;

    const handleNameCheck = async (value: any) => {

        value = value.toLowerCase()

        if (value.length < 3) {
            return setInputError('Subdomain must be at least 3 characters')
        }

        function regTest(str: string) {
            return /^[A-Za-z0-9]*$/.test(str)
        }

        if (regTest(value) && value != '') {
            setInputError('')
            siteNameAvailable.submit(
                { some: value },
                { method: "post", action: "/auth/valid-name" }
            );
        } else {
            setNameCheckCount(nameCheckCount + 1)
            setSiteNameValid(false)
            setInputError('Subdomain name invalid a-z 0-9 only! (no spaces)')
        }

    }

    useEffect(() => {
        if (siteNameAvailable.type === "done" && siteNameAvailable.data.nameFree) {
            setNameCheckCount(nameCheckCount + 1)
            setSiteNameValid(true)
        } else if (siteNameAvailable.type === "done" && !siteNameAvailable.data.nameFree) {
            setNameCheckCount(nameCheckCount + 1)
            if (input != subdomain) {
                setSiteNameValid(false)
            } else {
                setSiteNameValid(true)
            }
        }
    }, [siteNameAvailable]);


    return (
        <Box bg={'box'} width={'full'} mt={10} p={{ base: 2, md: 10 }} rounded={'lg'}>
            <Flex mb={5}>
                <Button onClick={() => nav(`/account`)} >Back</Button>
            </Flex>
            <Flex>
                <Box position={'relative'} border={'1px'} borderColor={'gray.300'} rounded={'lg'} p={4} maxH={'full'} maxWidth={'full'} cursor={'pointer'}>
                    <Flex justify={'flex-end'} display={page.published ? 'flex' : 'none'} >
                        <Tag colorScheme={'green'} position={'absolute'} top={'2%'} right={'2%'} zIndex={100}>{page.published ? 'Live' : null}</Tag>
                    </Flex>
                    <Stack>
                        <Stack>
                            <Box rounded={'md'} overflow={'hidden'} maxH={{ base: '250px', md: '180px' }}>
                                <Image src={page.cover ? page.cover : 'https://images.unsplash.com/photo-1554147090-e1221a04a025?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=848&q=80'} />
                            </Box>
                        </Stack>
                        <Flex justify={'center'} bg={'gray.200'} rounded={'md'} pb={1} pt={1}>
                            <Link href={`https://${page.site_name}.blotion.com`} isExternal>
                                <Text key={page.id}>https://{input}.blotion.com</Text>
                            </Link>
                        </Flex>
                    </Stack>
                </Box>
            </Flex>
            <Flex mt={5} direction={'column'}>
                <Form method='post' autoComplete="false">
                    <FormLabel>Subdomain</FormLabel>
                    <InputGroup gap={2}>
                        <Input value={input} name={'site_name'} isInvalid={nameCheckCount > 0} errorBorderColor={!siteNameValid ? "red.500" : "green.400"}
                            onChange={(e: any) => setInput(e.target.value)} pattern={"[0-9a-zA-Z_.-]*"} onBlur={(e: any) => handleNameCheck(e.target.value)} />
                        <Button type={'submit'} isDisabled={!siteNameValid} isLoading={isSubmitting}>Save</Button>
                    </InputGroup>
                </Form>
                <Text fontSize={'sm'} color={'red.400'} paddingLeft={2} paddingTop={1} paddingBottom={1} display={!siteNameValid && nameCheckCount > 0 ? 'flex' : 'none'}>{inputError === '' ? 'Site name already taken, try a different name.' : null}</Text>
                <Text fontSize={'sm'} color={'red.400'} paddingLeft={2} paddingTop={1} paddingBottom={1} display={inputError !== '' ? 'flex' : 'none'}>{inputError}</Text>
            </Flex>

            <Flex mt={5} direction={'column'}>
                <Form method='post' autoComplete="false">
                    <FormLabel>Custom Domain</FormLabel>
                    <InputGroup gap={2}>
                        <Input placeholder="coming soon" name={'custom_domain'} isDisabled />
                        <Button type={'submit'} isDisabled>Add</Button>
                    </InputGroup>
                </Form>
            </Flex>
        </Box>
    )
}