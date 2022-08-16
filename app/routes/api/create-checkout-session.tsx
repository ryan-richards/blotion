import { ActionFunction, json, redirect } from "@remix-run/node";
import { oAuthStrategy } from "~/lib/storage/auth.server";
import { supabaseDB } from "~/lib/storage/db.access";

export const action: ActionFunction = async ({ request }) => {

    const url = new URL(request.url);
    const plan = url.searchParams.get('plan');

    // check if user is trying to upgrade or downgrade
    const upgrade = url.searchParams.get('upgrade');

    const supaSession = await oAuthStrategy.checkSession(request, {
        failureRedirect: "/",
    });

    console.log(supaSession.user?.id)

    //performs actions on the database the user -- allow for RLS
    if (!supabaseDB.auth.session()) {
        supabaseDB.auth.setAuth(supaSession.access_token)
    }

    const { data } = await supabaseDB
        .from('users')
        .select('*')
        .eq('id', supaSession.user?.id)
        .single()

    const plans = [{
        id: 'creative_month',
        product_code: 'price_1LQZmWB4JLIlDcPQpjuAG4Ge',
    },
    {
        id: 'creative_year',
        product_code: 'price_1LQZmWB4JLIlDcPQRGvuQ3N5',
    },
    {
        id: 'pro_month',
        product_code: 'price_1LPPyoB4JLIlDcPQz15z4m2D',
    },
    {
        id: 'pro_year',
        product_code: 'price_1LQZmvB4JLIlDcPQJsYeg5RM',
    }]

    const plan_code = plans.find(p => p.id === plan)?.product_code
    console.log(plan_code)

    if (!data) {
        return json({ status: 'error', message: 'no stripe customer details found in supabase' });
    }

    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

    const session = await stripe.checkout.sessions.create({
        customer: data.stripe_customer_id,
        line_items: [
            {
                // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
                price: plan_code,
                quantity: 1,
            },
        ],
        mode: 'subscription',
        success_url: `https://www.blotion.com/payment?success=true`,
        cancel_url: `https://www.blotion.com/payment?canceled=true`,
        customer_update: { address: 'auto' },
        automatic_tax: { enabled: true },
    });

    if (session) {
        console.log(session)
        return redirect(session.url);
    }

    return json({ status: 'error' });
};