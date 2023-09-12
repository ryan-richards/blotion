import { Queue } from "quirrel/remix";
import { marked } from "marked";
import getPageLinks from "~/lib/notion/load-pageLinks";
import { getNotionPagebyID } from "~/lib/notion/notion-api";
import { supabaseAdmin } from "~/lib/storage/supabase.server";

const buildBlog = async (data: any, subdomain: any, token: any) => {
  const content = await getNotionPagebyID(data.index_page, token);
  const html = marked(content.markdown);
  const pageObject = content.pageObject;
  const pageLinks = await getPageLinks(pageObject, token);

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

  console.log("finished building blog", subdomain);
};

export default Queue("queues/build-blog", async (url: any) => {
  const subdomain = url.searchParams.get("subdomain");
  const token = url.searchParams.get("token");

  const { data, error } = await supabaseAdmin
    .from("sites")
    .select("*, users(secret_token)")
    .or(`site_name.eq.${subdomain}`)
    .single();

  if (!data.home_html) {
    await buildBlog(data, subdomain, token);
  }
});
