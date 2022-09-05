import { ActionFunction, json } from "@remix-run/node";

export const action: ActionFunction = async ({ request }) => {

  const data = await request.json();

  console.log(data.record.email)
  console.log(data)

  //data.record.email
  var postmark = require("postmark");

  // Send an email:
  var client = new postmark.ServerClient(process.env.POSTMARK_SERVER_TOKEN);

  await client.sendEmail({
    "From": "hello@blotion.com",
    "To": "ryan@ryanrichards.dev",
    "Subject": "Get started with Blotion",
    "Tag": "welcome",
    "HtmlBody": "<strong>Hello</strong> user, thanks for signing up for Blotion. We're excited to help you get started with your new account. <a href='https://guide.blotion.com/'>Click here</a> to get started.",
    "TextBody": "Hello from Postmark!",
    "MessageStream": "outbound"
  });

  return json({ status: 'success' });
};