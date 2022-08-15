import { ActionFunction, json } from "@remix-run/node";
import { supabaseAdmin } from "~/lib/storage/supabase.server";
import { decryptAPIKey } from "~/lib/utils/encrypt-api-key";

export const action: ActionFunction = async ({ request }) => {

    const data = await request.json();

    console.log(data)

    const decrypted = await decryptAPIKey(data.record.notion_token.toString());

    const { Client } = require('@notionhq/client');

    let pages;

    if (decrypted) {
        const notion = new Client({ auth: decrypted.toString() });

        pages = await notion.search({
            filter: {
                property: 'object',
                value: 'page',
            },
            sort: {
                direction: 'descending',
                timestamp: 'last_edited_time',
            },
        });
    }

    // find pages that have a parent type workspace
    const workspaces = pages.filter((page: { parent: { type: string; }; }) => page.parent.type === 'workspace');

    workspaces.map((workspace: { id: string; }) =>
        supabaseAdmin
            .from('connected_pages')
            .insert({
                user: data.record.id,
                page_id: workspace.id
            })
    )

    return json({status: 'connected pages stored'});
};