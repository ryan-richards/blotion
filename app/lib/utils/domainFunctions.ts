import { supabaseAdmin } from "../storage/supabase.server";

export function tidyName(str: string) {
  return str.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
}

export async function subdomainCheck(str: string) {
  let nameFree;

  const { data, error } = await supabaseAdmin
    .from("sites")
    .select("*")
    .match({ site_name: str })
    .single();

  if (data) {
    return (nameFree = false);
  } else if (!data) {
    return (nameFree = true);
  }
}
