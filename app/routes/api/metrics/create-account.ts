import { ActionFunction, json } from "@remix-run/node";
import { supabaseAdmin } from "~/lib/storage/supabase.server";

export const action: ActionFunction = async ({ request }) => {
  //get data from request database webhook
  const data = await request.json();
  const username = data.record.email;
  const accountLevel = data.record.plan;

  if (accountLevel === "free" || data.record.umami_user_id != null) {
    return json({
      status: "error, account must be above free to create metrics account",
    });
  }

  //create account
  var myHeaders = new Headers();
  myHeaders.append("Authorization", "Bearer " + process.env.UMAMI_ADMIN_TOKEN);
  myHeaders.append("Content-Type", "application/json");

  var raw = JSON.stringify({
    username: username,
    password: "admin",
  });

  var requestOptions: any = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };

  await fetch("https://umami-one-tan.vercel.app/api/account", requestOptions)
    .then((response) => response.text())
    .then(async (result) => {
      //console.log(result)
      //save the user_id to user table in supabase
      let obj = JSON.parse(result);

      await supabaseAdmin
        .from("users")
        .update({ umami_user_id: obj.user_id })
        .eq("email", username);
    })
    .catch((error) => {
      //console.log('error', error)
      return json({ status: "error creating account" });
    });

  return json({ status: "success, account was created" });
};
