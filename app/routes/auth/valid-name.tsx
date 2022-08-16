import { ActionFunction, json } from "@remix-run/node";
import { supabaseAdmin } from "~/lib/storage/supabase.server";


export const action: ActionFunction = async ({
    request,
}) => {
    try {
        let siteName = (await request.formData()).get('some')

        const { data, error } = await supabaseAdmin
            .from('sites')
            .select('*')
            .match({ site_name: siteName })
            .single()

        //console.log(data)
        //console.log(error?.message)

        if (data) {
            //console.log('match')
            return json({ nameFree: false })
        }

        else if (!data) {
            return json({ nameFree: true });
        }

        else if (error) throw error;

    } catch (error: any) {
        return json({ error: error.message });
    }
}