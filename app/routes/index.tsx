import { Text, Stack, Center, Heading, Flex, Menu, Icon, Button, Box, HStack, Link, List, ListItem, OrderedList, Image, AspectRatio, useBreakpointValue, MenuButton, MenuList, MenuItem, MenuDivider } from '@chakra-ui/react';
import { Prose } from '@nikolovlazar/chakra-ui-prose';
import { json, LoaderFunction, MetaFunction, redirect } from "@remix-run/node";
import { Link as RemixLink, useLoaderData } from '@remix-run/react';
import { marked } from 'marked';
import { FiCopy } from 'react-icons/fi';
import { getNotionPagebyID } from '~/lib/notion/notion-api';
import { signInWithNotion } from '~/lib/storage/supabase.client';
import { supabaseAdmin } from '~/lib/storage/supabase.server';
import TimeAgo from 'timeago-react';
import { decryptAPIKey } from '~/lib/utils/encrypt-api-key';
import { SiNotion } from "react-icons/si";
import blotionImage from '../../public/blotion_header.webp';
import { oAuthStrategy } from '~/lib/storage/auth.server';
import getPageLinks from '~/lib/notion/load-pageLinks';
import checkIndex from '~/lib/notion/check-index';

//regex function to remove special characters from string and replace spaces with hyphens
const slugify = (text: any) => {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

export const meta: MetaFunction = ({ data }) => {

  if (!data.data) return {
    title: 'Blotion',
    description: 'Turn your notion Database into Blog',
    "og:type": "website",
    "og:url": `https://www.blotion.com`,
    "og:title": `Blotion - Turn a Notion Database into a Blog`,
    "og:description": `Blotion is a Notion Database to Blog converter. Turn your notion Database into a Blog.`,
    "og:image": `https://tvypnxilpffosyzymcfm.supabase.co/storage/v1/object/public/blotion-assets/Desktop%20-%201%20(4).png`,
    "twitter:image": `https://tvypnxilpffosyzymcfm.supabase.co/storage/v1/object/public/blotion-assets/Desktop%20-%201%20(4).png`,
    "twitter:card": "summary_large_image",
    "twitter:creator": "@blotion_",
    "twitter:site": "@blotion_",
    "twitter:title": `Blotion - Turn a Notion Database into a Blog`,
    "twitter:description": 'Blotion is a minimalist website builder for converting Notion templates into a hosted blog website.',
  }

  return {
    title: `${data.data.site_name} ~ Blotion`,
    description: `${data.data.site_name} a minimalist blog built with Blotion.`,
    author: `${data.data.site_name}`,
    "og:type": "website",
    "og:url": `https://${data.data.site_name}.blotion.com`,
    "og:title": `${data.data.site_name}`,
    "og:description": `${data.data.site_name} a minimalist blog built with Blotion.`,
    "og:image": `${data.data.cover}`,
    "twitter:image": `${data.data.cover}`,
    "twitter:card": "summary_large_image",
    "twitter:creator": "@blotion_",
    "twitter:site": "@blotion_",
    "twitter:title": data.data.site_name,
    "twitter:description": `${data.data.site_name} a minimalist blog built with Blotion.`,
  };
};

export const loader: LoaderFunction = async ({ request, params }) => {

  const session = await oAuthStrategy.checkSession(request);

  const { data, status, preview, subdomain }: any = await checkIndex(request, session);

  if (!data) {
    return json({ status: 'home' })
  }

  if (status === 'home') {
    return json({ status: 'home' })
  }

  if (data.published === false && !preview) {
    //console.log('site not published')
    return redirect(process.env.NODE_ENV === "development" ? 'http://localhost:3000' : 'https://blotion.com')
  }

  if (preview) {
    if (preview !== data.owner) {
      return redirect(process.env.NODE_ENV === "development" ? 'http://localhost:3000' : 'https://blotion.com')
    }
  }

  //Site Exisits
  const decryptedToken = await decryptAPIKey(data.users.notion_token.toString())
  const content = await getNotionPagebyID(data.index_page, decryptedToken)

  const html = marked(content.markdown);
  const pageObject = content.pageObject
  const pageLinks = await getPageLinks(pageObject, decryptedToken)

  if (!data.db_page && pageObject?.posts) {
    const { data } = await supabaseAdmin
      .from('sites')
      .update({ db_page: pageObject?.posts })
      .match({ site_name: subdomain })
  }

  const previewMode = preview ? true : false

  return json({ data, html, pageObject, pageLinks, previewMode }, {
    headers: {
      "Cache-Control":
        "s-maxage=60, stale-while-revalidate=3600",
    },
  });
};


export function headers({ loaderHeaders }: { loaderHeaders: Headers }) {
  return {
    "cache-control": loaderHeaders.get("cache-control"),
  };
}

export default function Home() {

  const { data, status, html, pageObject, pageLinks, navItems, previewMode } = useLoaderData()
  //console.log(navItems)

  if (status === 'home') {
    return (
      <Stack gap={10} mt={{ base: 2, md: 10 }}>
        <Center width={'full'} h={{ base: 'full', md: '55vh' }}>
          <Stack>
            <Flex direction={'column'} align={'center'} gap={5}>
              <Flex mb={3}>
                <AspectRatio w='250px' p={10} ratio={5 / 4}>
                  <Image src={blotionImage} objectFit={'contain'}></Image>
                </AspectRatio>
              </Flex>

              <Flex direction={'column'} align={'center'}>
                <Heading>blotion</Heading>
                <Heading fontWeight={'normal'} size={'md'}>Create a blog with Notion</Heading>
              </Flex>


              <Flex direction={'column'} justify={'center'} align={'center'} gap={4}>
                <Text textAlign={'center'}>Blotion works with the template below</Text>
                <Flex w={'full'} align={'center'} direction={'column'} justify={'center'} gap={2}>
                  <Button minW={200} as={Link} href={'https://blotion-site.notion.site/Guide-949edbf9fc504b868ca3e701cf233655'} isExternal target={'_blank'}>
                    <Icon as={FiCopy} fontSize='xl' mr={2}></Icon>
                    Copy Template
                  </Button>
                  <Center>
                    <Text align={'center'}>and then...</Text>
                  </Center>
                  <Button
                    minW={200}
                    colorScheme='gray'
                    className={'button block'}
                    onClick={() => signInWithNotion()}
                  >
                    <Icon as={SiNotion} fontSize='xl' mr={2}></Icon>
                    <span>Login with Notion</span>
                  </Button>
                </Flex>
              </Flex>
            </Flex>
          </Stack>
        </Center>
      </Stack>
    )
  }

  return (
    <Stack mt={{ base: 2, md: 5 }}>
      <Prose>
        <Box dangerouslySetInnerHTML={{ __html: html }}></Box>
      </Prose>

      <Heading size={'md'} display={pageLinks && pageLinks.length > 0 ? 'flex' : 'none'} >{pageObject.postsTitle ? pageObject.postsTitle : 'Posts'}</Heading>
      <Stack>
        {pageLinks && pageLinks.map((page: any, index: number) =>
          <Link as={RemixLink} key={index} to={`/blog/${page.slug}`}>
            <Flex justify={'space-between'}>
              <Text maxW={{ base: '250px', md: 'full' }}>
                {page.title}
              </Text>
              <TimeAgo style={{ fontSize: '14px' }} datetime={page.date} />
            </Flex>
          </Link>
        )}
      </Stack>

      <Flex justify={'center'} display={previewMode ? 'flex' : 'none'} opacity={'50%'}>
        <Heading pt={10}>Site in Preview Mode</Heading>
      </Flex>

    </Stack>
  );

};
