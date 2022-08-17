import { json } from "@remix-run/node";
import { HttpMethod } from "../@types/http";
import { supabaseAdmin } from "../storage/supabase.server";

export async function createDomain(
    req: any,
) {

    const formData = await req.formData()
    const domain = formData.get("domain")
    const siteId = formData.get("site")

    if (Array.isArray(domain) || Array.isArray(siteId))
        return json({
            status: '400',
            message: 'domain and siteId must be strings'
        });

    try {
        const response = await fetch(
            `https://api.vercel.com/v8/projects/${process.env.VERCEL_PROJECT_ID}/domains`,
            {
                body: `{\n  "name": "${domain}"\n}`,
                headers: {
                    Authorization: `Bearer ${process.env.AUTH_BEARER_TOKEN}`,
                    "Content-Type": "application/json",
                },
                method: HttpMethod.POST,
            }
        );

        const data = await response.json();

        // Domain is already owned by another team but you can request delegation to access it
        if (data.error?.code === "forbidden") return json({
            status: '403',
            message: "Domain is already owned by another team but you can request delegation to access it",
        })

        // Domain is already being used by a different project
        if (data.error?.code === "domain_taken") return json({
            status: '409',
            message: "Domain is already being used by a different project",
        })
        // Domain is successfully added
        const { data: siteData, error: siteError } = await supabaseAdmin
            .from('sites')
            .update({ custom_domain: domain })
            .eq('id', siteId)

        if (siteError) console.log(siteError)
        if (siteData) console.log(siteData)

        return json({ status: '200', statusText: "Domain is successfully added" });
    } catch (error) {
        console.error(error);
        return json({ status: '500', statusText: "Something went wrong" });
    }
}

/**
 * Delete Domain
 *
 * Remove a domain from the vercel project using a provided
 * `domain` & `siteId` query parameters
 */
export async function deleteDomain(
    req: any,
) {
    const formData = await req.formData()
    const domain = formData.get("domain")
    const siteId = formData.get("site")

    if (Array.isArray(domain) || Array.isArray(siteId))
        return json({
            status: '400',
            statusText: 'domain and siteId must be strings'
        });

    try {
        const response = await fetch(
            `https://api.vercel.com/v6/domains/${domain}`,
            {
                headers: {
                    Authorization: `Bearer ${process.env.AUTH_BEARER_TOKEN}`,
                },
                method: HttpMethod.DELETE,
            }
        );

        await response.json();

        await supabaseAdmin
            .from('sites')
            .update({ custom_domain: null })
            .eq('id', siteId)

        return json({ status: '200', statusText: "Domain is successfully deleted" });
    } catch (error) {
        console.error(error);
        return json({ status: '500', statusText: "Something went wrong" });
    }
}