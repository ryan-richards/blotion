import { ActionFunction, json } from "@remix-run/node";
import { supabaseAdmin } from "~/lib/storage/supabase.server";

export const action: ActionFunction = async ({ request }) => {

    const formData = await request.formData();
    const siteID = formData.get('siteID')?.toString();
    const domain = formData.get('domain')?.toString();
    const umami_user_id = formData.get('umami_user_id')?.toString();
    
    console.log('siteID', siteID);
    console.log('domain', domain);
    console.log('umami_user_id', umami_user_id);

    if (!domain || !umami_user_id) {
        return json({ status: 'error, domain or umami_user_id missing' });
    }

    //flow for adding accounts - need to create and account -> add a website to that account
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", "Bearer " + process.env.UMAMI_ADMIN_TOKEN);

    let raw = JSON.stringify({
        "domain": domain,
        "name": domain,
        "owner": umami_user_id,
        "enable_share_url": false,
        "public": false,
    });

    let requestOptions: any = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    };

    await fetch("https://umami-one-tan.vercel.app/api/website", requestOptions)
        .then(response => response.text())
        .then(async (result) => {
            console.log(result)
            //add metrics tag to site on supabase table
            const obj = JSON.parse(result)

            await supabaseAdmin
                .from('sites')
                .update({ umami_website_id: obj.website_uuid })
                .eq('id', siteID)
        }
        )
        .catch(error => console.log('error', error));


    return json({ status: 'okay' });
}