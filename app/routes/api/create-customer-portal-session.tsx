import { ActionFunction, json, redirect } from "@remix-run/node";
import { oAuthStrategy } from "~/lib/storage/auth.server";
import { supabaseDB } from "~/lib/storage/db.access";

export const action: ActionFunction = async ({ request }) => {

    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

    const supaSession = await oAuthStrategy.checkSession(request, {
        failureRedirect: "/",
    });

    const { data } = await supabaseDB
        .from('user_data')
        .select('*')
        .eq('id', supaSession.user?.id)
        .single()

    const session = await stripe.billingPortal.sessions.create({
        customer: data.stripe_customer_id,
        return_url: 'http://www.blotion.com/account',
    });

    if (session) {
        return redirect(session.url);
    }

    return json({ status: 'error' });
};
