import { Queue } from "quirrel/remix";
import { Resend } from "resend";

export default Queue("queues/bulk-send", async (user: any) => {
  console.log("Sending bulk email to", user.email);

  const resend = new Resend(process.env.RESEND_API_KEY);

  if (!user.email) {
    return console.log("No email address for user", user.id);
  }

  await resend.emails.send({
    from: "Ryan <hello@blotion.com>",
    to: [user.email],
    subject: "Blotion Birthday!",
    html: `<body><p>Hello there,</p><p>Blotion is now 1 year old! </p><p>In that time I have offered a <strong>free plan</strong> to host a blog with notion on a blotion.com subdomain.</p><p>This week I have decided to remove the free plan, in favour of allowing new users to create draft site and <strong>upgrade</strong> to a paid plan when they are ready to go live.</p><p>If you are on a free plan and have a site already published, <u>don't worry</u>! Your site is not going anywhere! </p><p>This will only effect new users signing up.</p><p>If you are enjoying Blotion and would like to support the project consider upgrading to a paid plan <a href='https://www.blotion.com/pricing'>here</a></p><p>Thank you for your support<br><br>If you would like to unsubscribe from further email - click <a href='https://www.blotion.com/api/email/unsubscribe?id=${user.id}'>unsubscribe</a></p></body>`,
    text: "Blotion is 1 Year Old!",
  });
});
