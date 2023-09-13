import { ActionFunction } from "@remix-run/node";
import bulkEmailSender from "~/lib/server/bulkSend.server";
import { supabaseAdmin } from "~/lib/storage/supabase.server";

export const action: ActionFunction = async ({ request }) => {

    const { data } = await supabaseAdmin
        .from("email_list")
        .select("*")
        .eq("subscribed", true);

    data && data.forEach(async (user, index) => {

        const calcDelay = (index: number) => {
            if (index < 50) {
                return 10 + (index % 50 * 10 * 1000); // No delay for the first 50 records
            } else {
                const delayDays = Math.floor(index / 50); // Calculate the number of 50-record batches
                const delayMilliseconds = (delayDays * 24 * 60 * 60 * 1000) + (index % 50 * 10 * 1000); // Calculate the delay in milliseconds
                return `${delayMilliseconds}`; // Return the delay
            }
        };

        await bulkEmailSender.enqueue(user, {
            id: user.id,
            delay: calcDelay(index),
        });

    });

    return { status: 200 };
};
