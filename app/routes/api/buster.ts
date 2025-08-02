import { ActionFunction } from "@remix-run/node";
//import refreshBlogServer from "~/lib/server/refreshBlog.server";

export const action: ActionFunction = async ({ request }) => {
  const url = new URL(request.url);
  const site = url.searchParams.get("site")?.toString();

  /* await refreshBlogServer.enqueue(site, {
    id: site || "bust-blog",
    delay: "30s",
  }); */
  return { status: 200 };
};
