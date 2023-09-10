import { Queue } from "quirrel/remix";
import { marked } from "marked";
import getPageLinks from "~/lib/notion/load-pageLinks";
import { getNotionPagebyID } from "~/lib/notion/notion-api";
import { supabaseAdmin } from "~/lib/storage/supabase.server";
import { decryptAPIKey } from "~/lib/utils/encrypt-api-key";

const buildBlog = async (data: any, subdomain: any) => {
  const decryptedToken = await decryptAPIKey(
    data.users.notion_token.toString()
  );
  const content = await getNotionPagebyID(data.index_page, decryptedToken);
  const html = marked(content.markdown);
  const pageObject = content.pageObject;
  const pageLinks = await getPageLinks(pageObject, decryptedToken);

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

  const { data, error } = await supabaseAdmin
    .from("sites")
    .select("*, users(notion_token)")
    .or(`site_name.eq.${subdomain}`)
    .single();

  if (!data) {
    await buildBlog(data, subdomain);
  }
});
