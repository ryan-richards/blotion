import { marked } from "marked";
import { supabaseAdmin } from "../storage/supabase.server";
import { getNotionPagebyID } from "./notion-api";
import getPageLinks from "./load-pageLinks";

export async function generateBlog(data: any, subdomain: string) {
  const content = await getNotionPagebyID(
    data.index_page,
    data.users.secret_token.toString()
  );
  const html = marked(content.markdown);
  const pageObject = content.pageObject;
  const pageLinks = await getPageLinks(
    pageObject,
    data.users.secret_token.toString()
  );

  if (!data.db_page && pageObject?.posts) {
    await supabaseAdmin
      .from("sites")
      .update({ db_page: pageObject?.posts })
      .match({ site_name: subdomain });
  }

  if (!data.home_html && html) {
    await supabaseAdmin
      .from("sites")
      .update({
        home_html: html,
        page_links: pageLinks,
        page_object: pageObject,
      })
      .match({ site_name: subdomain });
  }

  return { html, pageObject, pageLinks };
}
