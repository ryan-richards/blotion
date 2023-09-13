import { LoaderFunction, json } from "@remix-run/node";
import { supabaseAdmin } from "~/lib/storage/supabase.server";

export const loader: LoaderFunction = async ({ request }) => {

    const url = new URL(request.url);
    const id = url.searchParams.get("id")?.toString();

    await supabaseAdmin.from("email_list").update({ subscribed: false }).match({ id: id });

    return json({ status: 200 });
};