import { Box, Flex, Heading, Link, Stack } from "@chakra-ui/react";
import { Prose } from "@nikolovlazar/chakra-ui-prose";
import { json, LoaderFunction, MetaFunction, redirect } from "@remix-run/node";
import { useLoaderData, Link as RemixLink, useLocation } from "@remix-run/react";
import { marked } from "marked";
import { getSingleBlogPost } from "~/lib/notion/notion-api";
import { supabaseAdmin } from "~/lib/storage/supabase.server";
import { decryptAPIKey } from "~/lib/utils/encrypt-api-key";


export const loader: LoaderFunction = async ({ request, params }) => {

    const host = new URL(request.url)
    if (!host) throw new Error('Missing host')

    const slug = params.slug?.toString();
    if (!slug) throw new Error('Missing pageID')

    let subdomain = null
    let customDomain = null

    if (host) {
        if (host.hostname === 'localhost') {
            return redirect('/')
        }
        subdomain = host.hostname.split('.')[0]

        if (subdomain === 'www' || subdomain === 'blotion') {
            return redirect('/')
        }

        if (!host.host.includes('blotion.com')) {
            customDomain = host.host
        }
    }

    const { data, error } = await supabaseAdmin
        .from('sites')
        .select('*, users(notion_token)')
        .or(`site_name.eq.${subdomain},custom_domain.eq.${customDomain}`)
        .eq('published', true)
        .single()

    if (!data) {
        return redirect('/')
    }

    const decryptedToken = await decryptAPIKey(data.users.notion_token.toString())
    const content = await getSingleBlogPost(data.db_page, decryptedToken, slug)


    if (!content) throw new Error('Missing pageID')

    //console.log(content)

    const html = marked(content.markdown)
    const post = content.post

    return json({ data, html, post },
        {
            headers: {
                "Cache-Control":
                    "s-maxage=60, stale-while-revalidate=3600",
            }
        });
};

export function headers({ loaderHeaders }: { loaderHeaders: Headers }) {
    return {
        "cache-control": loaderHeaders.get("cache-control"),
    };
}

interface MetaLoaderData {
    post: any
}

const objectIsEmpty = (obj: any) => Object.keys(obj).length === 0;

export const meta: MetaFunction = ({ params, data, location }) => {

    if (!data) return { title: 'Blotion' }

    const { post } = data as MetaLoaderData

    return {
        title: `${post.title}`,
        description: post.description,
        author: `${data.data.site_name}`,
        "og:type": "website",
        "og:url": `https://${data.data.site_name}.blotion.com/blog/${post?.slug}`,
        "og:title": `${post.title}`,
        "og:description": post.description,
        "og:image": `${post.cover}`,
        "twitter:image": `${post.cover}`,
        "twitter:card": "summary_large_image",
        "twitter:creator": "@blotion_",
        "twitter:site": "@blotion_",
        "twitter:title": post.title,
        "twitter:description": post.description,
    }
};

export default function Slug() {

    const { data, html, post } = useLoaderData()
    //console.log(post)

    return (
        <Stack mt={{ base: 2, md: 5 }}>
            <Flex>
                <Prose>
                    <Heading as={'h2'}>{post.title}</Heading>
                    <Box dangerouslySetInnerHTML={{ __html: html }}></Box>
                </Prose>
            </Flex>
        </Stack>
    )
}