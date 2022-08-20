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

    const page_name = params.page?.toString();
    if (!page_name) throw new Error('Missing pageID')

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
    const { Client } = require('@notionhq/client');
    const notion = new Client({ auth: decryptedToken.toString() });

    const pagebyname = await notion.search({
        query: page_name,
        sort: {
            direction: 'descending',
            timestamp: 'last_edited_time',
        },
    });
    //filter pagebyname where parent is equal to userdata.index_page
    //console.log(pagebyname.results)
    //console.log(pagebyname.results[0].parent)
    let pagebynamefilter
    pagebynamefilter = pagebyname.results.filter((page: any) => page.parent.page_id === data.index_page)
    //console.log(pagebynamefilter)

    if (pagebynamefilter.length < 1) {
        return redirect('/')
    }

    const content = await getNotionSubPagebyID(pagebynamefilter[0].id, decryptedToken)

    if (content.markdown === 'none') {

        let pageLinks: { title: any; slug: string; }[] = []

        content.dbResults?.map((page: any) => {

            let pageLink = {
                title: page.properties.Name.title[0].plain_text,
                slug: page.properties.Slug.formula.string,
                date: page.properties.Updated.last_edited_time,
            }

            pageLinks.push(pageLink)
        })

        //console.log(content.databaseName)

        return json({ data, pageLinks, pageTitle: content.databaseName })
    }


    const html = marked(content.markdown);
    const pageTitle = content.pageTitle

    return json({ data, html, pageTitle }, {
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

export default function Page() {
    const { data, pageLinks, html, pageTitle } = useLoaderData();



    return (
        <Stack mt={{ base: 2, md: 10 }}>
            <Link as={RemixLink} to={'/'}>
                <Heading size={'lg'}>{data.site_name}</Heading>
            </Link>

            <Stack pt={5} display={pageLinks ? 'flex' : 'none'}>
                <Heading as={'h1'} mb={{ base: 3, md: 4 }}>{pageTitle}</Heading>
                {pageLinks ? pageLinks.map((page: any) =>
                    <Link key={page.title} as={RemixLink} to={`/blog/${page.slug}`}>
                        <Flex justify={'space-between'}>
                            <Text>
                                {page.title}
                            </Text>
                            <TimeAgo datetime={page.date} style={{ fontSize: '14px' }} />
                        </Flex>
                    </Link>
                ) : null}
            </Stack>

            <Prose display={pageLinks ? 'none' : 'flex'}>
                <Flex direction={'column'}>
                    <Heading as={'h1'}>{pageTitle}</Heading>
                    <Box dangerouslySetInnerHTML={{ __html: html }}></Box>
                </Flex>
            </Prose>
        </Stack>
    )
}