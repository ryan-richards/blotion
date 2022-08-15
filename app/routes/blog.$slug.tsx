import { Box, Flex, Heading, Link, Stack } from "@chakra-ui/react";
import { Prose } from "@nikolovlazar/chakra-ui-prose";
import { json, LoaderFunction, redirect } from "@remix-run/node";
import { useLoaderData, Link as RemixLink } from "@remix-run/react";
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

    if (host) {
        if (host.hostname === 'localhost') {
            return json({ status: 'home' })
        }
        subdomain = host.hostname.split('.')[0]

        if (subdomain === 'notion-to-blog') {
            return json({ status: 'home' })
        }
    }

    const { data, error } = await supabaseAdmin
        .from('sites')
        .select('*, users(notion_token)')
        .match({ site_name: subdomain })
        .single()

    if (!data) {
        return redirect('/')
    }
    
    const decryptedToken = await decryptAPIKey(data.users.notion_token.toString())
    const content = await getSingleBlogPost(data.db_page, decryptedToken, slug)

    console.log(content)

    if (!content) throw new Error('Missing pageID')

    const html = marked(content.markdown)

    return json({ data, html },
        {
            headers: {
                "Cache-Control":
                    "s-maxage=60, stale-while-revalidate=3600",
            }
        });
};


export default function Slug() {

    const { data, html } = useLoaderData()

    return (
        <Stack mt={10}>
            <Link as={RemixLink} to={'/'}>
                <Heading size={'lg'}>{data.site_name}</Heading>
            </Link>

            <Flex pt={8}>
                <Prose>
                    <Box dangerouslySetInnerHTML={{ __html: html }}></Box>
                </Prose>
            </Flex>
        </Stack>
    )
}