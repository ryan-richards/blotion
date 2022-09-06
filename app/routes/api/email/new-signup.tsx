import { ActionFunction, json } from "@remix-run/node";

export const action: ActionFunction = async ({ request }) => {

  const data = await request.json();
  //data.record.email
  var postmark = require("postmark");

  // Send an email:
  var client = new postmark.ServerClient(process.env.POSTMARK_SERVER_TOKEN);

  if (!data.record.email) {
    return json({ status: 'false' });
  }

  await client.sendEmail({
    "From": "hello@blotion.com",
    "To": data.record.email,
    "Subject": "Welcome to Blotion",
    "Tag": "welcome",
    "HtmlBody": "<h1>Welcome</h1><p>Thanks for signing up for Blotion. We're excited to help you get started with your new account.</p><p><a href='https://guide.blotion.com/'>Click here</a> to find lots of help articles you might find useful when setting up your account.</p><p>The easiest way to get started is by following the <a href='https://guide.blotion.com/quick-start'>Quick Start Guide</a></p><p>Any problems, please get in touch!</p><div><span>Many thanks</span><p>Ryan</p></div>",
    "TextBody": "Thanks for signing up for Blotion!",
    "MessageStream": "outbound"
  });

  return json({ status: 'success' });
};