import { ActionFunction } from "@remix-run/node";
// import buildBlogServer from "~/lib/server/buildBlog.server";

export const action: ActionFunction = async ({ request }) => {
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId");

  /* await buildBlogServer.enqueue(url, {
    id: userId || "build-blog",
  });*/ 
  return { status: 200 };
};
