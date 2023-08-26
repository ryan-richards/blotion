import { ActionFunction, json } from "@remix-run/node";
import { Resend } from 'resend';

export const action: ActionFunction = async ({ request }) => {
    const data = await request.json();

    const resend = new Resend(process.env.RESEND_API_KEY);

    if (!data.record.email) {
        return json({ status: "false" });
    }

    await resend.emails.send({
        from: "Ryan <hello@blotion.com>",
        to: [data.record.email],
        subject: "Welcome to Blotion",
        html: "<h1>Welcome</h1><p>Thanks for signing up for Blotion. We're excited to help you get started with your new account.</p><p><a href='https://guide.blotion.com/'>Click here</a> to find lots of help articles you might find useful when setting up your account.</p><p>The easiest way to get started is by following the <a href='https://guide.blotion.com/quick-start'>Quick Start Guide</a></p><p>Any problems, please get in touch!</p><div><span>Many thanks</span><p>Ryan</p></div>",
        text: "Thanks for signing up for Blotion!",
    });

    return json({ status: "success" });
};