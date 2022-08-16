import { ActionFunction, json } from "@remix-run/node";
import { supabaseAdmin } from "~/lib/storage/supabase.server";

export const action: ActionFunction = async ({ request }: any) => {

    const data = await request.json();

    console.log(data)

    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const customer = await stripe.customers.create({
        email: data.record.email,
    });

    await supabaseAdmin
        .from('users')
        .update({
            stripe_customer_id: customer.id,
        })
        .eq('id', data.record.id)

    return json({ status: 'new stripe customer created and stored' });
};