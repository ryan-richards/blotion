import { ActionFunction } from "@remix-run/node";
import generateSiteServer from "~/lib/server/generateSite.server";

export const action: ActionFunction = async ({ request }) => {
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId");

  await generateSiteServer.enqueue(url, {
    id: userId || "generate-site",
  });
  return { status: 200 };
};
