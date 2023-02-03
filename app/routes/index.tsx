import { Stack, Heading, Flex, Box } from "@chakra-ui/react";
import { Prose } from "@nikolovlazar/chakra-ui-prose";
import { json, LoaderFunction, MetaFunction, redirect } from "@remix-run/node";
import { Link as RemixLink, useLoaderData } from "@remix-run/react";
import { marked } from "marked";
import { getNotionPagebyID } from "~/lib/notion/notion-api";
import { supabaseAdmin } from "~/lib/storage/supabase.server";
import { decryptAPIKey } from "~/lib/utils/encrypt-api-key";
import { oAuthStrategy } from "~/lib/storage/auth.server";
import getPageLinks from "~/lib/notion/load-pageLinks";
import checkIndex from "~/lib/notion/check-index";
import LandingPage from "~/lib/components/landingPage";
import BlogCard from "~/lib/components/blogCard";
import BlogTextLink from "~/lib/components/blogTextLink";
import { HttpMethod } from "~/lib/@types/http";

export const meta: MetaFunction = ({ data }) => {
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
    } - Blotion`,
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

export const loader: LoaderFunction = async ({ request }) => {
  const session = await oAuthStrategy.checkSession(request);

  const { data, status, preview, subdomain }: any = await checkIndex(
    request,
    session
  );

  if (!data) {
    return json(
      { status: "home" },
      {
        headers: {
          "Cache-Control": "s-maxage=86400, stale-while-revalidate=172800",
        },
      }
    );
  }

  if (status === "home") {
    return json(
      { status: "home" },
      {
        headers: {
          "Cache-Control": "s-maxage=86400, stale-while-revalidate=172800",
        },
      }
    );
  }

  if (data.published === false && !preview) {
    //console.log('site not published')
    return redirect(
      process.env.NODE_ENV === "development"
        ? "http://localhost:3000"
        : "https://blotion.com"
    );
  }

  if (preview) {
    if (preview !== data.owner) {
      return redirect(
        process.env.NODE_ENV === "development"
          ? "http://localhost:3000"
          : "https://blotion.com"
      );
    }
  }

  if (data.home_html) {
    const url =
      process.env.NODE_ENV === "development"
        ? "http://localhost:3000"
        : "https://blotion.com";
    const site = process.env.SERVERLESSQ_URL;
    try {
      await fetch(`${site}${url}/api/refresh-blog?site=${data.site_name}`, {
        method: HttpMethod.POST,
        headers: {
          Authorization: `Bearer ${process.env.AUTH_BEARER_TOKEN}`,
          "Content-Type": "application/json",
          "x-api-key": `${process.env.SERVERLESSQ_API_KEY}`,
        },
      });
    } catch (error) {
      console.error(error);
    }
    return json(
      {
        data,
        html: data.home_html,
        pageObject: data.page_object,
        pageLinks: data.page_links,
        preview,
      },
      {
        headers: {
          "Cache-Control": "s-maxage=600, stale-while-revalidate=7200",
        },
      }
    );
  }

  //This should only happen on the first load of the site
  const decryptedToken = await decryptAPIKey(
    data.users.notion_token.toString()
  );
  const content = await getNotionPagebyID(data.index_page, decryptedToken);
  const html = marked(content.markdown);
  const pageObject = content.pageObject;
  const pageLinks = await getPageLinks(pageObject, decryptedToken);

  if (!data.db_page && pageObject?.posts) {
    await supabaseAdmin
      .from("sites")
      .update({ db_page: pageObject?.posts })
      .match({ site_name: subdomain });
  }

  if (!data.home_html && html) {
    await supabaseAdmin
      .from("sites")
      .update({
        home_html: html,
        page_links: pageLinks,
        page_object: pageObject,
      })
      .match({ site_name: subdomain });
  }

  const previewMode = preview ? true : false;

  return json(
    { data, html, pageObject, pageLinks, previewMode },
    {
      headers: {
        "Cache-Control": "s-maxage=600, stale-while-revalidate=7200",
      },
    }
  );
};

export function headers({ loaderHeaders }: { loaderHeaders: Headers }) {
  return {
    "cache-control": loaderHeaders.get("cache-control"),
  };
}

export default function Home() {
  const { data, status, html, pageObject, pageLinks, previewMode } =
    useLoaderData();

  if (status === "home") {
    return <LandingPage />;
  }

  return (
    <Stack mt={{ base: 2, md: 5 }}>
      <Prose>
        <Box dangerouslySetInnerHTML={{ __html: html }}></Box>
      </Prose>

      <Heading
        size={"md"}
        display={pageLinks && pageLinks.length > 0 ? "flex" : "none"}
      >
        {pageObject.postsTitle || "Posts"}
      </Heading>

      <Stack>
        {pageLinks &&
          pageLinks.map((page: any, index: number) =>
            data.show_thumbnails ? (
              <BlogCard key={index} post={page} />
            ) : (
              <BlogTextLink key={index} page={page} />
            )
          )}
      </Stack>

      <Flex
        justify={"center"}
        display={previewMode ? "flex" : "none"}
        opacity={"50%"}
      >
        <Heading pt={10}>Site in Preview Mode</Heading>
      </Flex>
    </Stack>
  );
}
