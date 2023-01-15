import { ActionFunction, json } from "@remix-run/node";
import { marked } from "marked";
import getPageLinks from "~/lib/notion/load-pageLinks";
import { getNotionPagebyID } from "~/lib/notion/notion-api";
import { supabaseAdmin } from "~/lib/storage/supabase.server";
import { decryptAPIKey } from "~/lib/utils/encrypt-api-key";

const refresh = async (data: any, site: any) => {
    const decryptedToken = await decryptAPIKey(data.users.notion_token.toString())
    const content = await getNotionPagebyID(data.index_page, decryptedToken)
    const html = marked(content.markdown);
    const pageObject = content.pageObject
    const pageLinks = await getPageLinks(pageObject, decryptedToken)

    await supabaseAdmin
        .from('sites')
        .update({ home_html: html, page_links: pageLinks, page_object: pageObject, db_page: pageObject?.posts })
        .match({ site_name: site })

    console.log("finished refresh blog", site)
}

export const action: ActionFunction = async ({ request }) => {
    const authHeader = request.headers.get("Authorization");
    const token = authHeader?.split(" ")[1];

    if (token !== process.env.AUTH_BEARER_TOKEN) {
        return json({ status: 401, error: "unauthorized" });
    }

    const url = new URL(request.url);
    const site = url.searchParams.get("site");

    const { data, error } = await supabaseAdmin
        .from('sites')
        .select('*, users(notion_token)')
        .or(`site_name.eq.${site}`)
        .single()

    if (error) {
        return json({ status: 500, error: error.message });
    }

    if (data) {
        await refresh(data, site)
    }
    
    return json({ status: 200, data: "refreshing blog" });
};