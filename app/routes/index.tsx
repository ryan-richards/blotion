import { Text, Stack, Center, Heading, Flex, Icon, Button, Box, HStack, Link, List, ListItem, OrderedList, Image } from '@chakra-ui/react';
import { Prose } from '@nikolovlazar/chakra-ui-prose';
import { json, LoaderFunction, MetaFunction, redirect } from "@remix-run/node";
import { Link as RemixLink, useLoaderData } from '@remix-run/react';
import { marked } from 'marked';
import { FiBook, FiCheck, FiCopy } from 'react-icons/fi';
import { getDBid, getNotionPagebyID, getPublishedBlogPosts } from '~/lib/notion/notion-api';
import { signInWithNotion } from '~/lib/storage/supabase.client';
import { supabaseAdmin } from '~/lib/storage/supabase.server';
import TimeAgo from 'timeago-react';
import { decryptAPIKey } from '~/lib/utils/encrypt-api-key';
import { SiNotion } from "react-icons/si";
import blotionImage from '../../public/blotionImage.png'
import { oAuthStrategy } from '~/lib/storage/auth.server';

export const meta: MetaFunction = ({ data }) => {

  if (!data.data) return {
    title: 'blotion',
    description: 'Turn your notion Database into Blog',
  }

  return {
    title: `${data.data.site_name} ~ Blotion`,
    description: `${data.data.site_name} ~ Blotion`,
  };
};

export const loader: LoaderFunction = async ({ request, params }) => {

  const session = await oAuthStrategy.checkSession(request, {
    successRedirect: "/account",
  });

  const host = new URL(request.url)
  if (!host) throw new Error('Missing host')

  let subdomain = null
  let customDomain = null

  if (host) {
    if (host.hostname === 'localhost') {
      return json({ status: 'home' })
    }
    subdomain = host.hostname.split('.')[0]

    if (subdomain === 'www' || subdomain === 'blotion') {
      return json({ status: 'home' })
    }

    if (!host.host.includes('blotion.com')) {
      customDomain = host.host
    }
  }

  const { data, error } = await supabaseAdmin
    .from('sites')
    .select('*, users(notion_token)')
    .or(`site_name.eq.${subdomain},custom_domain.eq.${customDomain}`)
    .single()

  if (!data) {
    return json({ status: 'home' })
  }

  //Site Exisits
  const decryptedToken = await decryptAPIKey(data.users.notion_token.toString())
  const content = await getNotionPagebyID(data.index_page, decryptedToken)

  const html = marked(content.markdown);
  const pageObject = content.pageObject
  const nav = content.nav
  let pageLinks: { title: any; slug: string; }[] = []

  if (pageObject && pageObject.posts != '') {
    const posts = await getPublishedBlogPosts(pageObject.posts, decryptedToken)
    posts.map((page: any) => {
      let pageLink = {
        title: page.properties.Name.title[0].plain_text,
        slug: page.properties.slug.rich_text[0].plain_text,
        date: page.properties.Updated.last_edited_time,
      }
      pageLinks.push(pageLink)
    })
  }


  let navItems: { title: any, slug: any }[] = []

  if (nav) {
    nav.map((item: any) => {

      let page = item.parent

      let id = page.substring(
        page.indexOf("(") + 1,
        page.lastIndexOf(")")
      )

      let pageName = page.substring(
        page.indexOf("[") + 1,
        page.lastIndexOf(']'))

      let pageLink = {
        title: pageName,
        slug: id,
      }

      navItems.push(pageLink)
    })
  }

  if (!data.db_page && pageObject?.posts) {
    const { data } = await supabaseAdmin
      .from('sites')
      .update({ db_page: pageObject?.posts })
      .match({ site_name: subdomain })
  }

  return json({ data, html, pageObject, pageLinks, navItems }, {
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

  const { data, status, html, pageObject, pageLinks, navItems } = useLoaderData()

  if (status === 'home') {
    return (
      <Stack gap={10} mt={{ base: 2, md: 10 }}>
        <Center width={'full'} h={{ base: 'full', md: '55vh' }}>
          <Stack>
            <Flex direction={'column'} align={'center'} gap={5}>
              <Flex mb={3}>
                <Image src={blotionImage} maxH={250}></Image>
              </Flex>

              <Flex direction={'column'} align={'center'}>
                <Heading>blotion</Heading>
                <Heading fontWeight={'normal'} size={'md'}>Create a blog with Notion</Heading>
              </Flex>

              <Center mt={5}>
                <List w={'full'} marginLeft={'auto'} marginRight={'auto'} spacing={2}>
                  <ListItem>
                    <Button minW={200} as={Link} href={'https://pinnate-tie-7a0.notion.site/Ryan-s-Website-7304261e002b417db66fdbe742c05a49'} isExternal target={'_blank'}>
                      <Icon as={FiCopy} fontSize='xl' mr={2}></Icon>
                      Copy Template
                    </Button>
                  </ListItem>

                  <Center>
                    <ListItem alignItems={'center'}>and then...</ListItem>
                  </Center>

                  <ListItem>
                    <Button
                      minW={200}
                      mt={2}
                      mr={2}
                      colorScheme='gray'
                      className={'button block'}
                      onClick={() => signInWithNotion()}
                    >
                      <Icon as={SiNotion} fontSize='xl' mr={2}></Icon>
                      <span>Login with Notion</span>
                    </Button>
                  </ListItem>
                </List>
              </Center>
            </Flex>
          </Stack>
        </Center>
      </Stack>
    )
  }

  return (
    <Stack mt={{ base: 2, md: 10 }}>
      <Flex direction={'row'} justify={'space-between'}>
        <Heading size={'lg'}>{data.site_name}</Heading>

        <HStack gap={1}>
          {navItems.map((item: any) =>
            <Link key={item.slug} as={RemixLink} to={item.slug}>{item.title}</Link>
          )}
        </HStack>

      </Flex>

      <Prose>
        <Box dangerouslySetInnerHTML={{ __html: html }}></Box>
      </Prose>

      <Heading size={'md'}>{pageObject.postsTitle ? pageObject.postsTitle : 'Posts'}</Heading>
      <Stack>
        {pageLinks.map((page: any, index: number) =>
          <Link as={RemixLink} key={index} to={`/blog/${page.slug}`}>
            <Flex justify={'space-between'} direction={{ base: 'column', md: 'row' }}>
              <Text>
                {page.title}
              </Text>
              <TimeAgo style={{ fontSize: '12px' }} datetime={page.date} />
            </Flex>
          </Link>
        )}
      </Stack>
    </Stack>
  );

};
