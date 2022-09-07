import { Box, Flex, Image, Stack, Tag, Text, Link, FormLabel, Input, InputGroup, Button, TableContainer, Table, TableCaption, Thead, Tr, Th, Tbody, Td, Tfoot, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, FormControl, Switch, Heading, Divider } from "@chakra-ui/react";
import { ActionFunction, json, LoaderFunction, redirect } from "@remix-run/node";
import { Form, useActionData, useFetcher, useLoaderData, useTransition, useNavigate, useSubmit } from "@remix-run/react";
import { oAuthStrategy } from "~/lib/storage/auth.server";
import { supabaseAdmin } from "~/lib/storage/supabase.server";
import { useEffect, useState, } from "react";


export const loader: LoaderFunction = async ({ request, params }) => {

    const session = await oAuthStrategy.checkSession(request, {
        failureRedirect: "/",
    });

    const page = params.page;

    if (!page) {
        return json({
            status: 'error',
            message: 'No page specified',
        });
    }

    const { data: userData } = await supabaseAdmin
        .from("users")
        .select("plan")
        .eq('id', session.user?.id)
        .single()

    const { data: siteData } = await supabaseAdmin
        .from('sites')
        .select('*')
        .eq('id', page)
        .eq('owner', session.user?.id)
        .single()

    if (!siteData) {
        return json({
            status: 'error',
            message: 'Page not found',
        });
    }

    return json({ siteData, userData });
};


export const action: ActionFunction = async ({ request, params }) => {

    const session = await oAuthStrategy.checkSession(request, {
        failureRedirect: "/",
    });

    const formData = await request.formData();
    let siteName = formData.get('site_name');
    const revue_profile = formData.get('revue_profile');
    const action = formData.get('action');
    let showThumbnails = formData.get('show-thumbnails');

   

    console.log(showThumbnails);

    if (!action && !siteName) {

        if (showThumbnails == 'show-thumbnails') {
            await supabaseAdmin
                .from('sites')
                .update({ show_thumbnails: true })
                .eq('id', params.page)
                .eq('owner', session.user?.id)
            return json({ status: 'success', message: 'Settings updated' });
        }

        if (!showThumbnails) {
            await supabaseAdmin
                .from('sites')
                .update({ show_thumbnails: false })
                .eq('id', params.page)
                .eq('owner', session.user?.id)
            return json({ status: 'success', message: 'Settings updated' });
        }
    }

    if (action) {
        if (action === 'delete_site') {
            await supabaseAdmin
                .from('sites')
                .delete()
                .eq('id', params.page)
                .eq('owner', session.user?.id)

            return redirect('/account')
        }
        if (action === 'add_revue' && revue_profile) {
            await supabaseAdmin
                .from('sites')
                .update({
                    revue_profile: revue_profile
                })
                .eq('id', params.page)
                .eq('owner', session.user?.id)
            return json({ status: 'success' })
        }
        if (action === 'remove_revue') {
            await supabaseAdmin
                .from('sites')
                .update({
                    revue_profile: null
                })
                .eq('id', params.page)
                .eq('owner', session.user?.id)
            return json({ status: 'success' })
        }
    }

    if (!siteName) {
        return json({
            status: 'error',
            message: 'No site name specified',
        });
    }

    siteName = siteName.toString().toLowerCase()

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

    const { siteData: page, userData } = useLoaderData()
    const [subdomain, setSubdomain] = useState(page.site_name)
    const nav = useNavigate();
    const submit = useSubmit();

    const actionData = useActionData();
    const siteNameAvailable = useFetcher()
    const customDomainAction = useFetcher()
    const checkCustomDomain = useFetcher()
    let [siteNameValid, setSiteNameValid] = useState(false)
    let [nameCheckCount, setNameCheckCount] = useState(0)
    let [input, setInput] = useState(page.site_name)
    let [customDomain, setCustomDomain] = useState(page.custom_domain ? page.custom_domain : '')
    let [revueProfile, setRevueProfile] = useState(page.revue_profile ? page.revue_profile : '')
    let [inputError, setInputError] = useState('')
    const transition = useTransition();

    //State for confirming site deletion
    const [deleteInput, setDeleteInput] = useState('')
    const deleteConfirm = `delete-${page.site_name}`

    //State for thumbanail display switch
    const [showThumbnails, setShowThumbnails] = useState(page.show_thumbnails)

    const { isOpen, onOpen, onClose } = useDisclosure()

    const isSubmitting = transition.state === 'submitting'
    let isSaved = actionData ? actionData.status === 'success' : false;

    let customDomainStatus = customDomainAction.data ? customDomainAction.data.status : '';

    const handleNameCheck = async (value: any) => {

        value = value.toLowerCase()

        if (value.length < 3) {
            return setInputError('Subdomain must be at least 3 lowercase characters')
        }

        function regTest(str: string) {
            return /^[a-z0-9]*$/.test(str)
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
            setInputError('Subdomain name invalid lowercase a-z 0-9 only! (no spaces)')
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

    useEffect(() => {
        //check if domain is configured correctly
        //console.log('checking custom domain')

        if (page.custom_domain) {
            checkCustomDomain.submit(
                { domain: page.custom_domain },
                { method: "post", action: "/api/check-domain" }
            );

        }
    }, [customDomainStatus]);

    const customDomainConfigured = checkCustomDomain.data ? checkCustomDomain.data.valid ? true : false : false

    const addCustomDomain = async (value: any) => {
        const formData = new FormData();
        formData.append("site", page.id);
        formData.append("domain", value);
        customDomainAction.submit(
            formData,
            { method: "post", action: "/api/domain" }
        );
    }

    const removeCustomDomain = async (value: any) => {
        const formData = new FormData();
        formData.append("site", page.id);
        formData.append("domain", value);

        customDomainAction.submit(
            formData,
            { method: "delete", action: "/api/domain" }
        );
    }

    const handleChange = (event: any) => {
        setShowThumbnails(!showThumbnails)
        submit(event.currentTarget, { replace: true });
    }


    return (
        <Box bg={'box'} width={'full'} mt={10} p={{ base: 2, md: 10 }} rounded={'lg'}>
            <Flex mb={5}>
                <Button onClick={() => nav(`/account`)}>Back</Button>
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
                                <Text key={page.id}>https://{input.toLowerCase()}.blotion.com</Text>
                            </Link>
                        </Flex>
                    </Stack>
                </Box>
            </Flex>

            <Divider mt={5}></Divider>

            <Flex mt={5} direction={'column'} gap={2}>
                <Heading fontSize={'xl'}>Apperance Settings</Heading>
                <Form method={'post'} onChange={handleChange}>
                    <FormControl display='flex' alignItems='center'>
                        <FormLabel htmlFor='show-thumbnails' mb='0'>
                            Show blog post thumbnails?
                        </FormLabel>
                        <Switch id='show-thumbnails' name={'show-thumbnails'} value="show-thumbnails" isChecked={showThumbnails} />
                    </FormControl>
                </Form>
            </Flex>

            <Divider mt={5}></Divider>

            <Flex mt={5} direction={'column'}>
                <Form method={'post'}>
                    <FormLabel>Revue Newsletter</FormLabel>
                    <InputGroup gap={2}>
                        <Input placeholder="revue profile name" name={'revue_profile'} value={revueProfile} isDisabled={userData.plan === 'free' || !page.published} onChange={(e: any) => setRevueProfile(e.target.value)} />
                        {!page.revue_profile ?
                            <Button type={'submit'} name={'action'} value={'add_revue'} colorScheme={'blue'} isDisabled={!revueProfile} isLoading={isSubmitting}>Add</Button> :
                            <Button type={'submit'} name={'action'} value={'remove_revue'} colorScheme={'red'} isDisabled={!revueProfile} isLoading={isSubmitting}>Remove</Button>}
                    </InputGroup>
                </Form>
            </Flex>


            <Flex mt={5} direction={'column'}>
                <Form method='post' autoComplete="false">
                    <FormLabel>Subdomain (lowercase)</FormLabel>
                    <InputGroup gap={2}>
                        <Input value={input} name={'site_name'} isInvalid={nameCheckCount > 0} errorBorderColor={!siteNameValid ? "red.500" : "green.400"}
                            onChange={(e: any) => setInput(e.target.value)} pattern={"[0-9a-z_.-]*"} onBlur={(e: any) => handleNameCheck(e.target.value)} />
                        <Button type={'submit'} isDisabled={!siteNameValid} isLoading={isSubmitting}>Save</Button>
                    </InputGroup>
                </Form>
                <Text fontSize={'sm'} color={'red.400'} paddingLeft={2} paddingTop={1} paddingBottom={1} display={!siteNameValid && nameCheckCount > 0 ? 'flex' : 'none'}>{inputError === '' ? 'Site name already taken, try a different name.' : null}</Text>
                <Text fontSize={'sm'} color={'red.400'} paddingLeft={2} paddingTop={1} paddingBottom={1} display={inputError !== '' ? 'flex' : 'none'}>{inputError}</Text>
            </Flex>

            <Flex mt={5} direction={'column'}>
                <FormLabel>Custom Domain</FormLabel>
                <InputGroup gap={2}>
                    <Input placeholder="your domain" name={'custom_domain'} value={customDomain} isDisabled={userData.plan === 'free' || !page.published} onChange={(e: any) => setCustomDomain(e.target.value)} />
                    {!page.custom_domain ?
                        <Button type={'submit'} colorScheme={'blue'} isDisabled={!customDomain} onClick={() => addCustomDomain(customDomain)} isLoading={isSubmitting} >Add</Button> :
                        <Button type={'submit'} colorScheme={'red'} isDisabled={!customDomain} onClick={() => removeCustomDomain(customDomain)} isLoading={isSubmitting} >Remove</Button>}
                </InputGroup>
                <Flex direction={'column'} align={'center'} mt={3} display={customDomainConfigured ? 'flex' : 'none'}>
                    <Text color={'green.400'}>Domain is successfully configured</Text>
                    <Text color={'green.400'}>Please allow 48hr for DNS changes to take effect</Text>
                </Flex>
            </Flex>

            {page.custom_domain && !customDomainConfigured ?
                <Flex direction={'column'} mt={5}>
                    <TableContainer>
                        <Table variant='simple'>
                            <TableCaption>Set the above record on your DNS provider to continue</TableCaption>
                            <Thead>
                                <Tr>
                                    <Th>Type</Th>
                                    <Th>Name</Th>
                                    <Th>Value</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                <Tr>
                                    <Td>A</Td>
                                    <Td>@</Td>
                                    <Td>76.76.21.21</Td>
                                </Tr>
                            </Tbody>
                        </Table>
                    </TableContainer>
                </Flex>
                : null}


            <Flex justify={'flex-end'} mt={10}>
                <Button size={'sm'} colorScheme={'red'} onClick={onOpen}>Delete Site</Button>
            </Flex>

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Are you sure?</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody mb={5}>
                        <Text>This will delete your site and all of its content.</Text>
                        <FormLabel mt={2}>Please type delete-{page.site_name}</FormLabel>
                        <InputGroup gap={2}>
                            <Input onChange={(e) => setDeleteInput(e.target.value)}></Input>
                            <Form method={'post'}>
                                <Button type={'submit'} name={'action'} value={'delete_site'} isDisabled={deleteInput != deleteConfirm} colorScheme={'red'}>Delete</Button>
                            </Form>
                        </InputGroup>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </Box>
    )
}