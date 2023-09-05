import { Stack, Heading, Flex, Box } from "@chakra-ui/react";
import { Prose } from "@nikolovlazar/chakra-ui-prose";
import { json, LoaderFunction, MetaFunction, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { oAuthStrategy } from "~/lib/storage/auth.server";
import checkIndex from "~/lib/notion/check-index";
import LandingPage from "~/lib/components/landingPage";
import BlogCard from "~/lib/components/blogCard";
import BlogTextLink from "~/lib/components/blogTextLink";
import { HttpMethod } from "~/lib/@types/http";
import { generateBlog } from "~/lib/notion/gen-blog";

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
    title: `${data.data.siteName ? data.data.siteName : data.data.site_name
      } - Blotion`,
    description: `${data.data.siteName ? data.data.siteName : data.data.site_name
      } a minimalist blog built with Blotion.`,
    author: `${data.data.siteName ? data.data.siteName : data.data.site_name}`,
    "og:type": "website",
    "og:url": `https://${data.data.site_name}.blotion.com`,
    "og:title": `${data.data.siteName ? data.data.siteName : data.data.site_name
      }`,
    "og:description": `${data.data.siteName ? data.data.siteName : data.data.site_name
      } a minimalist blog built with Blotion.`,
    "og:image": `${data.data.cover}`,
    "twitter:image": `${data.data.cover}`,
    "twitter:card": "summary_large_image",
    "twitter:creator": "@blotion_",
    "twitter:site": "@blotion_",
    "twitter:title": data.data.siteName
      ? data.data.siteName
      : data.data.site_name,
    "twitter:description": `${data.data.siteName ? data.data.siteName : data.data.site_name
      } a minimalist blog built with Blotion.`,
  };
};

export const loader: LoaderFunction = async ({ request }) => {
  const session = await oAuthStrategy.checkSession(request);

  const { data, status, preview, subdomain }: any = await checkIndex(
    request,
    session
  );

  const cacheControlHeaders = {
    "Cache-Control": "s-maxage=86400, stale-while-revalidate=172800",
  };

  if (!data || status === "home") {
    return json({ status: "home" }, { headers: cacheControlHeaders });
  }

  if (data.published === false && !preview) {
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
        : "https://www.blotion.com";
    try {
      await fetch(`${url}/api/buster?site=${data.site_name}`, {
        method: HttpMethod.POST,
        headers: {
          "Content-Type": "application/json",
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
          "Cache-Control": "s-maxage=1200, stale-while-revalidate=7200",
        },
      }
    );
  }

  const { html, pageObject, pageLinks } = await generateBlog(data, subdomain);

  return json(
    { data, html, pageObject, pageLinks, preview },
    {
      headers: {
        "Cache-Control": "s-maxage=1200, stale-while-revalidate=7200",
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
