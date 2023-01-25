import { Box, Heading, Stack, Link, Text, Flex } from "@chakra-ui/react";
import { Prose } from "@nikolovlazar/chakra-ui-prose";
import { json, LoaderFunction, MetaFunction, redirect } from "@remix-run/node";
import { useLoaderData, Link as RemixLink, useParams } from "@remix-run/react";
import { marked } from "marked";
import TimeAgo from "timeago-react";
import BlogCard from "~/lib/components/blogCard";
import BlogTextLink from "~/lib/components/blogTextLink";
import {
  getNotionPagebyID,
  getNotionSubPagebyID,
  pageToPostTransformer,
} from "~/lib/notion/notion-api";
import { supabaseAdmin } from "~/lib/storage/supabase.server";
import { decryptAPIKey } from "~/lib/utils/encrypt-api-key";
import { capitalize } from "~/lib/utils/slugify";

export const meta: MetaFunction = ({ data, params }) => {
  let page = params.page?.toString();
  let pageTitle = page ? capitalize(page) : page;

  if (!data.data)
    return {
      title: "Blotion - Generate a Blog with Notion",
      description:
        "Blotion allows you to generate and manage a free hosted blog with Notion. Start your blog in minutes and use the power of Notion as a CMS.",
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
      "twitter:description":
        "Blotion is a minimalist website builder for converting Notion templates into a hosted blog website.",
    };

  return {
    title: `${
      data.data.siteName ? data.data.siteName : data.data.site_name
    } - ${pageTitle}`,
    description: `${
      data.data.siteName ? data.data.siteName : data.data.site_name
    } a minimalist blog built with Blotion.`,
    author: `${data.data.siteName ? data.data.siteName : data.data.site_name}`,
    "og:type": "website",
    "og:url": `https://${data.data.site_name}.blotion.com`,
    "og:title": `${
      data.data.siteName ? data.data.siteName : data.data.site_name
    }`,
    "og:description": `${
      data.data.siteName ? data.data.siteName : data.data.site_name
    } a minimalist blog built with Blotion.`,
    "og:image": `${data.data.cover}`,
    "twitter:image": `${data.data.cover}`,
    "twitter:card": "summary_large_image",
    "twitter:creator": "@blotion_",
    "twitter:site": "@blotion_",
    "twitter:title": data.data.siteName
      ? data.data.siteName
      : data.data.site_name,
    "twitter:description": `${
      data.data.siteName ? data.data.siteName : data.data.site_name
    } a minimalist blog built with Blotion.`,
  };
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const host = new URL(request.url);
  if (!host) throw new Error("Missing host");

  const pageID = params.page?.toString();
  if (!pageID) throw new Error("Missing pageID");

  const page_name = params.page?.toString();
  if (!page_name) throw new Error("Missing pageID");

  let subdomain = null;
  let customDomain = null;

  if (host) {
    if (host.hostname === "localhost") {
      return redirect("/");
    }
    subdomain = host.hostname.split(".")[0];

    if (subdomain === "www") {
      subdomain = host.hostname.split(".")[1];
    }

    if (subdomain === "blotion") {
      return redirect("/");
    }

    if (!host.host.includes("blotion.com")) {
      customDomain = host.host;
    }
  }

  const { data, error } = await supabaseAdmin
    .from("sites")
    .select("*, users(notion_token)")
    .or(`site_name.eq.${subdomain},custom_domain.eq.${customDomain}`)
    .eq("published", true)
    .single();

  if (!data) {
    return redirect("/");
  }

  const decryptedToken = await decryptAPIKey(
    data.users.notion_token.toString()
  );
  const { Client } = require("@notionhq/client");
  const notion = new Client({ auth: decryptedToken.toString() });

  const pagebyname = await notion.search({
    query: page_name,
    sort: {
      direction: "descending",
      timestamp: "last_edited_time",
    },
  });

  let pagebynamefilter;
  pagebynamefilter = pagebyname.results.filter(
    (page: any) => page.parent.page_id === data.index_page
  );

  if (pagebynamefilter.length < 1) {
    return redirect("/");
  }

  const content = await getNotionSubPagebyID(
    pagebynamefilter[0].id,
    decryptedToken
  );

  if (content.markdown === "none") {
    let pageLinks: any[] = [];

    content.dbResults?.map((page: any) => {
      const post = pageToPostTransformer(page);
      pageLinks.push(post);
    });

    return json(
      { data, pageLinks, pageTitle: content.databaseName },
      {
        headers: {
          "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400",
        },
      }
    );
  }

  const html = marked(content.markdown);
  const pageTitle = content.pageTitle;

  return json(
    { data, html, pageTitle },
    {
      headers: {
        "Cache-Control": "s-maxage=60, stale-while-revalidate=3600",
      },
    }
  );
};

export function headers({ loaderHeaders }: { loaderHeaders: Headers }) {
  return {
    "cache-control": loaderHeaders.get("cache-control"),
  };
}

export default function Page() {
  const { data, pageLinks, html, pageTitle } = useLoaderData();

  return (
    <Stack mt={{ base: 2, md: 5 }}>
      <Stack pt={5} display={pageLinks ? "flex" : "none"}>
        <Heading as={"h1"} mb={{ base: 3, md: 4 }}>
          {pageTitle}
        </Heading>

        {data.show_thumbnails ? (
          <Stack>
            {pageLinks && pageLinks.length > 0 ? (
              pageLinks.map((page: any, index: number) => (
                <BlogCard key={index} post={page} />
              ))
            ) : (
              <Text>No posts yet</Text>
            )}
          </Stack>
        ) : (
          <Stack>
            {pageLinks && pageLinks.length > 0 ? (
              pageLinks.map((page: any, index: number) => (
                <BlogTextLink key={index} page={page} />
              ))
            ) : (
              <Text>No posts yet found</Text>
            )}
          </Stack>
        )}
      </Stack>

      <Prose display={pageLinks ? "none" : "flex"}>
        <Flex direction={"column"}>
          <Heading as={"h1"}>{pageTitle}</Heading>
          <Box dangerouslySetInnerHTML={{ __html: html }}></Box>
        </Flex>
      </Prose>
    </Stack>
  );
}
