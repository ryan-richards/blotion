import { Text, Stack, Center, Heading, Flex, Menu, chakra, Icon, Button, Box, HStack, Link, List, ListItem, OrderedList, Image, AspectRatio, useBreakpointValue, MenuButton, MenuList, MenuItem, MenuDivider, IconButton, Tooltip, Divider, Grid, Highlight, textDecoration } from '@chakra-ui/react';
import { FiCopy, FiEdit, FiLoader } from 'react-icons/fi';
import { SiNotion } from "react-icons/si";
import { signInWithNotion } from '../storage/supabase.client';
import header from '../../../public/header1.webp'
import { useRef, useState } from 'react';
import guide1 from '../../../public/guide1.webp'
import guide2 from '../../../public/guide2.webp'
import guide3 from '../../../public/guide3.webp'
import guide4 from '../../../public/guide4.webp'
import feature1 from '../../../public/feature1.webp'
import feature2 from '../../../public/feature2.webp'
import feature3 from '../../../public/feature3.webp'
import feature4 from '../../../public/feature4.webp'
import darkmode from '../../../public/darkmode.webp'
import { useNavigate } from '@remix-run/react';
import { motion } from "framer-motion";


export default function LandingPage() {
    
    const nav = useNavigate()
    const scrollRef = useRef(null)

    const steps = [
        {
            id: 1,
            title: 'Copy the Blotion Template',
            image: guide1
        },
        {
            id: 2,
            title: 'Start editing the template',
            image: guide3
        },
        {
            id: 3,
            title: 'Login to Blotion with Notion',
            image: guide2
        },
        {
            id: 4,
            title: 'Your site is live!',
            image: guide4
        },
    ]

    const features = [
        {
            id: 1,
            title: 'SEO + Meta Tags',
            info: 'Blotion optimises every blog post for SEO by automatically generating the correct meta tag infomation that helps google find your writing',
            image: feature1
        },
        {
            id: 2,
            title: 'Categories',
            info: 'As you manage your blog posts in Notion, you can easily categorise to each post by adding a tag in Notion page properties',
            image: feature2
        },
        {
            id: 3,
            title: "It's fast",
            info: 'Every page is cached on using the Vercel Edge Network. Meaning pages load quickly, no matter where your readers are in the world',
            image: feature3
        },
        {
            id: 4,
            title: "Notion as CMS",
            info: 'No need to learn a new CMS tool. All of your site content is fetched from Notion. So simply edit your content in Notion and it will be automatically updated in the Blotion site',
            image: feature4
        },
    ]

    const [activeImage, setActiveImage] = useState(steps[0]);
    const [activeFeature, setActiveFeature] = useState(features[0])

    const Feature = (props: any) => {
        return (
            <Flex align={'center'}>
                <Icon
                    boxSize={5}
                    mt={1}
                    mr={2}
                    color="brand.500"
                    _dark={{
                        color: "brand.300",
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
                <chakra.p
                    fontSize="lg"
                    color="gray.700"
                    _dark={{
                        color: "gray.400",
                    }}
                    {...props}
                />
            </Flex>
        );
    };


    let offscreen = {
        y: 50,
        opacity: 0,
    }

    let onscreen = {
        opacity: 100,
        y: 0,
        transition: {
            type: "spring",
            bounce: 0.2,
            duration: 0.9,
            opacity: { duration: 3.2 }
        }
    }

    return (
        <Stack gap={10} mt={20}>
            <Stack>
                <Flex direction={'column'} align={'center'} gap={3}>

                    <Flex as={motion.div} initial={offscreen}
                        whileInView={onscreen} viewport={{ once: true }} direction={'column'} justify={'center'} align={'center'}>
                        <Flex direction={'column'} align={'center'} gap={2}>
                            <Heading fontWeight={'semibold'} textAlign={'center'} size={'2xl'}>Generate a blog with Notion.</Heading>
                            <Heading fontWeight={'normal'} mt={2} maxW={'88%'} textAlign={'center'} size={'md'}>Use a Notion template to generate a hosted blog. Allowing you to edit and publish blog posts from the comfort of your Notion workspace.</Heading>
                            <Flex w={'full'} align={'center'} direction={{ base: 'column', md: 'row' }} justify={'center'} gap={2} mt={10}>
                                <Button size={'lg'} style={{ textDecoration: 'none' }} minW={200} as={Link} href={'https://blotion-site.notion.site/Guide-949edbf9fc504b868ca3e701cf233655'} isExternal target={'_blank'}>
                                    <Icon as={FiCopy} fontSize='xl' mr={2}></Icon>
                                    Copy Template
                                </Button>
                                <Button
                                    size={'lg'}
                                    minW={200}
                                    variant={'outline'}
                                    className={'button block'}
                                    onClick={() => signInWithNotion()}
                                >
                                    <Icon as={SiNotion} fontSize='xl' mr={2}></Icon>
                                    <span>Login with Notion</span>
                                </Button>
                            </Flex>
                        </Flex>

                        <Flex w='full'>
                            <Image src={header} objectFit={'contain'} ></Image>
                        </Flex>
                    </Flex>

                    <Flex ref={scrollRef} direction={'column'} justify={'center'} align={'center'}>

                        <Flex as={motion.div} initial={offscreen}
                            whileInView={onscreen} viewport={{ once: true }} direction={'column'} justify={'center'} align={'center'} gap={2} mt={20}>
                            <Heading textAlign={'center'} >How does Blotion Work?</Heading>
                            <Heading fontSize={'lg'} fontWeight={'normal'}>It's pretty simple.</Heading>
                            <HStack mt={{ base: 5, md: 8 }} spacing={{ base: 5, md: 20 }}>
                                <Tooltip label={'Copy the Blotion Template'} hasArrow placement='top'>
                                    <IconButton
                                        size={'lg'}
                                        colorScheme={activeImage.id === 1 ? 'green' : 'gray'}
                                        rounded={'full'}
                                        isActive={activeImage.id === 1}
                                        variant={'outline'}
                                        aria-label="Copy Icon Step"
                                        onClick={() => setActiveImage(steps[0])}
                                        icon={<Icon fontSize={'xl'} as={FiCopy} />}
                                    />
                                </Tooltip>
                                <Tooltip label={'Edit the template'} hasArrow placement='top'>
                                    <IconButton
                                        size={'lg'}
                                        colorScheme={activeImage.id === 2 ? 'green' : 'gray'}
                                        isActive={activeImage.id === 2}
                                        rounded={'full'}
                                        variant={'outline'}
                                        aria-label="Edit Icon Step"
                                        onClick={() => setActiveImage(steps[1])}
                                        icon={<Icon fontSize={'xl'} as={FiEdit} />}
                                    />
                                </Tooltip>
                                <Tooltip label={'Login with Notion'} hasArrow placement='top'>
                                    <IconButton
                                        size={'lg'}
                                        colorScheme={activeImage.id === 3 ? 'green' : 'gray'}
                                        rounded={'full'}
                                        variant={'outline'}
                                        isActive={activeImage.id === 3}
                                        aria-label="Notion Icon Step"
                                        onClick={() => setActiveImage(steps[2])}
                                        icon={<Icon fontSize={'xl'} as={SiNotion} />}
                                    />
                                </Tooltip>
                                <Tooltip label={'Your site is live'} hasArrow placement='top'>
                                    <>
                                        <IconButton
                                            id={'site_live'}
                                            size={'lg'}
                                            colorScheme={activeImage.id === 4 ? 'green' : 'gray'}
                                            rounded={'full'}
                                            variant={'outline'}
                                            isActive={activeImage.id === 4}
                                            aria-label="Live Icon Step"
                                            onClick={() => setActiveImage(steps[3])}
                                            icon={<Icon fontSize={'xl'} as={FiLoader} />}
                                        />
                                    </>
                                </Tooltip>
                            </HStack>
                            <Flex mt={10} direction={'column'} gap={8}>
                                <Heading fontSize={'xl'} textAlign={'center'}>{activeImage.title}</Heading>
                                <Image src={activeImage.image} loading={'lazy'} rounded={'2xl'} />
                                <Heading textAlign={'center'} fontSize={'lg'} fontWeight={'medium'}>You site will be hosted on <Text fontWeight={'bold'}>yoursubdomain.blotion.com</Text>
                                </Heading>
                            </Flex>
                        </Flex>

                        <Flex as={motion.div} initial={offscreen}
                            whileInView={onscreen} viewport={{ once: true }} direction={'column'} justify={'center'} align={'center'} gap={4} mt={20} width={'full'}>
                            <Heading>Why use Blotion?</Heading>
                            <Heading fontSize={'lg'} fontWeight={'normal'}>All the boring stuff is taken care of so you can focus on writing.</Heading>

                            <Flex as={motion.div} initial={offscreen}
                                whileInView={onscreen} viewport={{ once: true }} direction={'row'} justify={'space-between'} width={'full'} mt={10} display={{ base: 'none', md: 'flex' }} minH={380}>
                                <Stack width={'50%'} spacing={5}>
                                    {features.map((feature) =>
                                        <Heading key={feature.id} cursor={'pointer'} opacity={activeFeature.id === feature.id ? '100%' : '55%'} onClick={() => setActiveFeature(feature)} onMouseOver={() => setActiveFeature(feature)}>{feature.title}</Heading>
                                    )}
                                </Stack>
                                <Stack width={'50%'}>
                                    <Image src={activeFeature?.image} rounded={'lg'} width={'380px'}></Image>
                                    <Text fontSize={'xl'}>{activeFeature.info}</Text>
                                </Stack>
                            </Flex>

                            <Flex as={motion.div} initial={offscreen}
                                whileInView={onscreen} viewport={{ once: true }} direction={'row'} justify={'center'} mt={5} display={{ base: 'flex', md: 'none' }}>
                                <Stack spacing={10}>
                                    {features.map((feature) =>
                                        <Flex key={feature.id} direction={'column'} align={'center'} gap={4} pb={10}>
                                            <Image src={feature?.image} rounded={'lg'} width={'full'} h={'full'}></Image>
                                            <Heading size={'lg'}>{feature.title}</Heading>
                                            <Text textAlign={'left'} fontSize={'md'}>{feature.info}</Text>
                                        </Flex>
                                    )}
                                </Stack>
                            </Flex>
                        </Flex>

                        <Flex as={motion.div} initial={offscreen}
                            whileInView={onscreen} viewport={{ once: true }} direction={'column'} justify={'center'} align={'center'} gap={4} mt={20} width={'full'}>

                            <Flex w='full' mb={5}>
                                <Image src={darkmode} loading={'lazy'} objectFit={'contain'} rounded={'2xl'} width={'800px'} h={'full'} ></Image>
                            </Flex>
                            <Flex direction={'column'} as={motion.div} initial={offscreen}
                                whileInView={onscreen} viewport={{ once: true }}>
                                <Heading>Make it your own!</Heading>
                                <Text fontSize={'xl'}>
                                    Creative + Pro Accounts Unlock
                                </Text>
                            </Flex>
                            <Grid templateColumns={{ base: 'repeat(2,1fr)', md: 'repeat(3,1fr)' }} gap={6} mt={5} as={motion.div} initial={offscreen}
                                whileInView={onscreen} viewport={{ once: true }}>
                                <Feature>Dark/Light Toggle</Feature>
                                <Feature>Custom Domains</Feature>
                                <Feature>
                                    <Highlight query={'(Pro Only)'} styles={{ px: '2', py: '1', rounded: 'full', bg: 'purple.100' }}>
                                        Remove Blotion Branding (Pro Only)
                                    </Highlight>
                                </Feature>
                                <Feature><Highlight query={'(Pro Only)'} styles={{ px: '2', py: '1', rounded: 'full', bg: 'purple.100' }}>
                                    Site Analytics (Pro Only)
                                </Highlight></Feature>
                                <Feature>Custom Blog Logo (Coming Soon)</Feature>
                                <Feature>Newsletter Integration (Coming Soon)</Feature>
                            </Grid>
                            <Flex as={motion.div} initial={offscreen}
                                whileInView={onscreen} viewport={{ once: true }} justify={'center'}>

                                <Button size={'lg'} onClick={() => nav('/pricing')} mt={5}>View Pricing</Button>
                            </Flex>
                        </Flex>


                        <Flex as={motion.div} initial={offscreen}
                            whileInView={onscreen} viewport={{ once: true }} direction={'column'} justify={'center'} align={'center'} gap={4} mt={20} width={'full'} mb={40} bg={'gray.50'} p={10} rounded={'2xl'}>
                            <Heading textAlign={'center'}>I think you're ready to start a blog.</Heading>
                            <Text textAlign={'center'} fontSize={'xl'}>Start by duplicating the template below into your Notion Workspace!</Text>
                            <Button mt={2} size={'lg'} minW={200} as={Link} colorScheme={'gray'} variant={'outline'} style={{ textDecoration: 'none' }} href={'https://blotion-site.notion.site/Guide-949edbf9fc504b868ca3e701cf233655'} isExternal target={'_blank'}>
                                <Icon as={FiCopy} fontSize='xl' mr={2}></Icon>
                                Copy Template
                            </Button>
                            <Flex align={'center'} gap={1} mt={2}>
                                <Heading textAlign={'center'} fontSize={'lg'} fontWeight={'medium'}>Learn more</Heading>
                                <Link textAlign={'center'} href={'https://guide.blotion.com'} fontSize={'lg'} fontWeight={'bold'} isExternal>guide.blotion.com</Link>
                            </Flex>
                        </Flex>

                    </Flex>

                </Flex>
            </Stack>
        </Stack >
    )
}
