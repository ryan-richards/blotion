import { json, redirect } from "@remix-run/node";
import { Session, supabaseAdmin } from "../storage/supabase.server";

export default async function checkIndex(request: Request, session: any) {
  const url = new URL(request.url);
  const preview = url.searchParams.get("preview");
  const host = new URL(request.url);
  if (!host) throw new Error("Missing host");

  let subdomain = null;
  let customDomain = null;
  let status = null;

  if (host) {
    subdomain = host.hostname.split(".")[0];

    if (subdomain === "www") {
      subdomain = host.hostname.split(".")[1];
    }

    if (host.hostname === "localhost" && !session) {
      status = "home";
    }

    if (subdomain === "blotion" || subdomain === "localhost") {
      if (session) {
        return redirect("/account");
      }

      status = "home";
    }

    if (!host.host.includes("blotion.com")) {
      customDomain = host.host;
    }
  }

  if (status === "home") {
    return status;
  }

  const { data, error } = await supabaseAdmin
    .from("sites")
    .select("*, users(notion_token,plan)")
    .or(`site_name.eq.${subdomain},custom_domain.eq.${customDomain}`)
    .single();

  if (!data) {
    return (status = "home");
  }

  return { data, status, preview, subdomain };
}
