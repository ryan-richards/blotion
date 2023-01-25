import { ActionFunction, json } from "@remix-run/node";
import { supabaseAdmin } from "~/lib/storage/supabase.server";

const endpointSecret = process.env.STRIPE_WEBHOOK_SIG;
const localEndpointSecret = process.env.STRIPE_LOCAL_WEBHOOK_SIG;
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const endpoint =
  process.env.NODE_ENV === "development" ? localEndpointSecret : endpointSecret;

export const action: ActionFunction = async ({ request }) => {
  const sig = request.headers.get("stripe-signature");
  //console.log(sig)
  const payload = await request.text();
  //console.log(payload)

  let event;

  try {
    event = stripe.webhooks.constructEvent(payload, sig, endpoint);
  } catch (err) {
    //console.log(err)
    return json({ status: "error" });
  }

  const plans = [
    {
      id: "creative_month",
      product_code: "price_1LZGg9F1IUyiGjXJGyH0BRMc",
    },
    {
      id: "creative_year",
      product_code: "price_1LZGg9F1IUyiGjXJtCyAImlL",
    },
    {
      id: "pro_month",
      product_code: "price_1LZGfkF1IUyiGjXJnOXaKC4G",
    },
    {
      id: "pro_year",
      product_code: "price_1LZGfkF1IUyiGjXJindA8W6X",
    },
  ];

  const plans_live = [
    {
      id: "creative_month",
      product_code: "price_1LZGNXF1IUyiGjXJV0nhP5GS",
    },
    {
      id: "creative_year",
      product_code: "price_1LZGNXF1IUyiGjXJRQy9RMqp",
    },
    {
      id: "pro_month",
      product_code: "price_1LZGMzF1IUyiGjXJgDBzIkyz",
    },
    {
      id: "pro_year",
      product_code: "price_1LZGMzF1IUyiGjXJq8FCxKOw",
    },
  ];

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const customer = session.customer;

      const { line_items } = await stripe.checkout.sessions.retrieve(
        session.id,
        {
          expand: ["line_items"],
        }
      );

      const plan = line_items.data[0].price.id;
      const planPurchasedTest = plans.find(
        (p) => p.product_code === plan
      )?.product_code;
      const planPurchasedLive = plans_live.find(
        (p) => p.product_code === plan
      )?.product_code;
      const planPurchased =
        process.env.NODE_ENV === "development"
          ? planPurchasedTest
          : planPurchasedLive;
      //const planPurchased = planPurchasedTest

      // Save an order in your database, marked as 'awaiting payment'
      //console.log('Awaiting Payment:', session.id);
      //createOrder(session);

      // Check if the order is paid (for example, from a card payment)
      //
      // A delayed notification payment will have an `unpaid` status, as
      // you're still waiting for funds to be transferred from the customer's
      // account.

      let planLevel;

      if (
        planPurchased === "price_1LZGfkF1IUyiGjXJnOXaKC4G" ||
        planPurchased === "price_1LZGfkF1IUyiGjXJindA8W6X"
      ) {
        planLevel = "pro";
      }

      //live check pro
      if (
        planPurchased === "price_1LZGMzF1IUyiGjXJgDBzIkyz" ||
        planPurchased === "price_1LZGMzF1IUyiGjXJq8FCxKOw"
      ) {
        planLevel = "pro";
      }

      if (
        planPurchased === "price_1LZGg9F1IUyiGjXJGyH0BRMc" ||
        planPurchased === "price_1LZGg9F1IUyiGjXJtCyAImlL"
      ) {
        planLevel = "creative";
      }

      //live check creative
      if (
        planPurchased === "price_1LZGNXF1IUyiGjXJV0nhP5GS" ||
        planPurchased === "price_1LZGNXF1IUyiGjXJRQy9RMqp"
      ) {
        planLevel = "creative";
      }

      if (session.payment_status === "paid") {
        //console.log('Payment succeeded for order:', session.id);
        const { data } = await supabaseAdmin
          .from("users")
          .update({ plan: planLevel })
          .eq("stripe_customer_id", customer);
        return json({ status: "success" });
      }

      break;
    }

    case "checkout.session.async_payment_succeeded": {
      const session = event.data.object;
      const customer = session.customer;

      const { line_items } = await stripe.checkout.sessions.retrieve(
        session.id,
        {
          expand: ["line_items"],
        }
      );

      //console.log(line_items)

      // Fulfill the purchase...
      //console.log('Payment succeeded for order:', session.id);
      const { data } = await supabaseAdmin
        .from("users")
        .update({ plan: "pro" })
        .eq("stripe_customer_id", customer);

      break;
    }

    case "checkout.session.async_payment_failed": {
      const session = event.data.object;

      // Send an email to the customer asking them to retry their order
      //console.log('Payment failed for order:', session.id);
      //emailCustomerAboutFailedPayment(session);

      break;
    }

    //webhook for upgraded or downgraded plans
    case "customer.subscription.updated": {
      //console.log('customer subscription updated')
      const subscription = event.data.object;
      //console.log(subscription)

      const customer = subscription.customer;
      const plan = subscription.plan.id;
      const planPurchasedTest = plans.find(
        (p) => p.product_code === plan
      )?.product_code;
      const planPurchasedLive = plans_live.find(
        (p) => p.product_code === plan
      )?.product_code;
      const planPurchased =
        process.env.NODE_ENV === "development"
          ? planPurchasedTest
          : planPurchasedLive;
      //const planPurchased = planPurchasedTest
      const cancelled = subscription.cancel_at_period_end;

      if (cancelled) {
        return json({ status: "plan successfully cancelled" });
      }

      let planLevel;

      if (
        planPurchased === "price_1LZGfkF1IUyiGjXJnOXaKC4G" ||
        planPurchased === "price_1LZGfkF1IUyiGjXJindA8W6X"
      ) {
        planLevel = "pro";
      }

      //live check pro
      if (
        planPurchased === "price_1LZGMzF1IUyiGjXJgDBzIkyz" ||
        planPurchased === "price_1LZGMzF1IUyiGjXJq8FCxKOw"
      ) {
        planLevel = "pro";
      }

      if (
        planPurchased === "price_1LZGg9F1IUyiGjXJGyH0BRMc" ||
        planPurchased === "price_1LZGg9F1IUyiGjXJtCyAImlL"
      ) {
        planLevel = "creative";
      }

      //live check creative
      if (
        planPurchased === "price_1LZGNXF1IUyiGjXJV0nhP5GS" ||
        planPurchased === "price_1LZGNXF1IUyiGjXJRQy9RMqp"
      ) {
        planLevel = "creative";
      }

      if (planLevel) {
        const { data } = await supabaseAdmin
          .from("users")
          .update({ plan: planLevel })
          .eq("stripe_customer_id", customer);
        return json({ status: "success" });
      }

      break;
    }

    //webhook for cancelled plans
    case "customer.subscription.deleted": {
      //console.log('customer subscription deleted')

      const subscription = event.data.object;
      const customer = subscription.customer;

      if (customer) {
        const { data } = await supabaseAdmin
          .from("users")
          .update({ plan: "free" })
          .eq("stripe_customer_id", customer);
        return json({ status: "success" });
      }
    }
  }

  return json({ status: "error" });
};
