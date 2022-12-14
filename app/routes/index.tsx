import { Text, Stack, Center, Heading, Flex, Menu, Icon, Button, Box, HStack, Link, List, ListItem, OrderedList, Image, AspectRatio, useBreakpointValue, MenuButton, MenuList, MenuItem, MenuDivider } from '@chakra-ui/react';
import { Prose } from '@nikolovlazar/chakra-ui-prose';
import { json, LoaderFunction, MetaFunction, redirect } from "@remix-run/node";
import { Link as RemixLink, useLoaderData } from '@remix-run/react';
import { marked } from 'marked';
import { getNotionPagebyID } from '~/lib/notion/notion-api';
import { supabaseAdmin } from '~/lib/storage/supabase.server';
import TimeAgo from 'timeago-react';
import { decryptAPIKey } from '~/lib/utils/encrypt-api-key';
import { oAuthStrategy } from '~/lib/storage/auth.server';
import getPageLinks from '~/lib/notion/load-pageLinks';
import checkIndex from '~/lib/notion/check-index';
import LandingPage from '~/lib/components/landingPage';
import RevueForm from '~/lib/components/revueForm';
import BlogCard from '~/lib/components/blogCard';
import BlogTextLink from '~/lib/components/blogTextLink';

export const meta: MetaFunction = ({ data }) => {

  if (!data.data) return {
    title: 'Blotion - Generate a Blog with Notion',
    description: 'Blotion allows you to generate and manage a free hosted blog with Notion. Start your blog in minutes and use the power of Notion as a CMS.',
    "og:type": "website",
    "og:url": `https://www.blotion.com`,
    "og:title": `Blotion - Generate a Blog with Notion`,
    "og:description": `Blotion allows you to generate and manage a free hosted blog with Notion. Start your blog in minutes.`,
    "og:image": `https://tvypnxilpffosyzymcfm.supabase.co/storage/v1/object/public/blotion-assets/ogimageheader.png`,
    "twitter:image": `https://tvypnxilpffosyzymcfm.supabase.co/storage/v1/object/public/blotion-assets/ogimageheader.png`,
    "twitter:card": "summary_large_image",
    "twitter:creator": "@blotion_",
    "twitter:site": "@blotion_",
    "twitter:title": `Blotion - Generate a Blog with Notion`,
    "twitter:description": 'Blotion is a minimalist website builder for converting Notion templates into a hosted blog website.',
  }

  return {
    title: `${data.data.siteName ? data.data.siteName : data.data.site_name} - Blotion`,
    description: `${data.data.siteName ? data.data.siteName : data.data.site_name} a minimalist blog built with Blotion.`,
    author: `${data.data.siteName ? data.data.siteName : data.data.site_name}`,
    "og:type": "website",
    "og:url": `https://${data.data.site_name}.blotion.com`,
    "og:title": `${data.data.siteName ? data.data.siteName : data.data.site_name}`,
    "og:description": `${data.data.siteName ? data.data.siteName : data.data.site_name} a minimalist blog built with Blotion.`,
    "og:image": `${data.data.cover}`,
    "twitter:image": `${data.data.cover}`,
    "twitter:card": "summary_large_image",
    "twitter:creator": "@blotion_",
    "twitter:site": "@blotion_",
    "twitter:title": data.data.siteName ? data.data.siteName : data.data.site_name,
    "twitter:description": `${data.data.siteName ? data.data.siteName : data.data.site_name} a minimalist blog built with Blotion.`,
  };
};

export const loader: LoaderFunction = async ({ request, params }) => {

  const session = await oAuthStrategy.checkSession(request);

  const { data, status, preview, subdomain }: any = await checkIndex(request, session);

  if (!data) {
    return json({ status: 'home' }, {
      headers: {
        "Cache-Control":
          "s-maxage=86400, stale-while-revalidate=172800",
      },
    })
  }

  if (status === 'home') {
    return json({ status: 'home' }, {
      headers: {
        "Cache-Control":
          "s-maxage=86400, stale-while-revalidate=172800",
      },
    })
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

  if (status === 'home') {
    return (
      <LandingPage />
    )
  }

  return (
    <Stack mt={{ base: 2, md: 5 }}>
      <Prose>
        <Box dangerouslySetInnerHTML={{ __html: html }}></Box>
      </Prose>

      <Heading size={'md'} display={pageLinks && pageLinks.length > 0 ? 'flex' : 'none'} >{pageObject.postsTitle ? pageObject.postsTitle : 'Posts'}</Heading>

      {data.show_thumbnails ?
        <Stack>
          {pageLinks && pageLinks.map((page: any, index: number) =>
            <BlogCard key={index} post={page} />
          )}
        </Stack>
        :
        <Stack>
          {pageLinks && pageLinks.map((page: any, index: number) =>
            <BlogTextLink key={index} page={page} />
          )}
        </Stack>
      }

      <Flex justify={'center'} pt={10} display={data.revue_profile ? 'flex' : 'none'}>
        <RevueForm revue_profile={data.revue_profile} />
      </Flex>

      <Flex justify={'center'} display={previewMode ? 'flex' : 'none'} opacity={'50%'}>
        <Heading pt={10}>Site in Preview Mode</Heading>
      </Flex>
    </Stack>
  );

};
