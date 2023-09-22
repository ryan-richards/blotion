import { Queue } from "quirrel/remix";
import { marked } from "marked";
import getPageLinks from "~/lib/notion/load-pageLinks";
import { getNotionNav, getNotionPagebyID } from "~/lib/notion/notion-api";
import { supabaseAdmin } from "~/lib/storage/supabase.server";
import navData from "../notion/load-nav";

const refresh = async (data: any, site: any) => {
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

  const { nav } = await getNotionNav(
    data.index_page,
    data.users.secret_token.toString()
  );
  const navItems = await navData(nav);

  await supabaseAdmin
    .from("sites")
    .update({
      home_html: html,
      page_links: pageLinks,
      page_object: pageObject,
      db_page: pageObject?.posts,
      nav_links: navItems,
    })
    .match({ site_name: site });

  console.log("finished refresh blog", site);
};

export default Queue("queues/bust-blog", async (site: any) => {
  const { data, error } = await supabaseAdmin
    .from("sites")
    .select("*, users(secret_token)")
    .or(`site_name.eq.${site}`)
    .single();

  if (data) {
    await refresh(data, site);
  }
});
