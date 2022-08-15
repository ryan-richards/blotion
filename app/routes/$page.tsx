import { Box, Heading, Stack, Link, Text, Flex } from "@chakra-ui/react";
import { Prose } from "@nikolovlazar/chakra-ui-prose";
import { json, LoaderFunction, redirect } from "@remix-run/node";
import { useLoaderData, Link as RemixLink, useParams } from "@remix-run/react";
import { marked } from "marked";
import TimeAgo from "timeago-react";
import { getNotionPagebyID, getNotionSubPagebyID } from "~/lib/notion/notion-api";
import { supabaseAdmin } from "~/lib/storage/supabase.server";
import { decryptAPIKey } from "~/lib/utils/encrypt-api-key";

export const loader: LoaderFunction = async ({ request, params }) => {

    const host = new URL(request.url)
    if (!host) throw new Error('Missing host')

    const pageID = params.page?.toString();
    if (!pageID) throw new Error('Missing pageID')

    let subdomain = null

    if (host) {
        if (host.hostname === 'localhost') {
            return json({ status: 'home' })
        }
        subdomain = host.hostname.split('.')[0]

        if (subdomain === 'blotion') {
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
    const content = await getNotionSubPagebyID(pageID, decryptedToken)

    if (content.markdown === 'none') {

        console.log(content.dbResults)

        let pageLinks: { title: any; slug: string; }[] = []

        content.dbResults?.map((page: any) => {

            let pageLink = {
                title: page.properties.Name.title[0].plain_text,
                slug: page.properties.slug.rich_text[0].plain_text,
                date: page.properties.Updated.last_edited_time,
            }
            console.log(pageLink)

            pageLinks.push(pageLink)
        })

        console.log(pageLinks)

        return json({ data, pageLinks })
    }


    const html = marked(content.markdown);

    return json({ data, html }, {
        headers: {
            "Cache-Control":
                "s-maxage=60, stale-while-revalidate=3600",
        },
    });
};



export default function Page() {
    const { data, pageLinks, html } = useLoaderData();

    const params = useParams();
    const dbID = params.page?.toString();

    return (
        <Stack mt={10}>
            <Link as={RemixLink} to={'/'}>
                <Heading size={'lg'}>{data.site_name}</Heading>
            </Link>

            <Stack pt={5}>
                {pageLinks ? pageLinks.map((page: any) =>
                    <Link key={page.title} as={RemixLink} to={`/blog/${page.slug}`}>
                        <Flex justify={'space-between'}>
                            <Text>
                                {page.title}
                            </Text>
                            <TimeAgo datetime={page.date} />
                        </Flex>
                    </Link>
                ) : null}
            </Stack>

            <Prose>
                <Box dangerouslySetInnerHTML={{ __html: html }}></Box>
            </Prose>
        </Stack>
    )
}