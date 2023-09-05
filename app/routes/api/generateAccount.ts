import { ActionFunction } from "@remix-run/node";
import { json } from "remix-utils";
import { supabaseAdmin } from "~/lib/storage/supabase.server";
import { subdomainCheck, tidyName } from "~/lib/utils/domainFunctions";
import { decryptAPIKey } from "~/lib/utils/encrypt-api-key";

export const action: ActionFunction = async ({ request }) => {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  const userId = url.searchParams.get("userId");

  if (token) {
    const { data, error } = await supabaseAdmin
      .from("users")
      .update({ notion_token: token })
      .eq("id", userId);

    if (data) {
      const { data: userData } = await supabaseAdmin
        .from("users")
        .select("*, sites(*)")
        .eq("id", userId)
        .single();

      const decrypted = await decryptAPIKey(userData.notion_token.toString());

      const { Client } = require("@notionhq/client");

      let pages;

      if (decrypted) {
        const notion = new Client({ auth: decrypted.toString() });

        pages = await notion.search({
          sort: {
            direction: "descending",
            timestamp: "last_edited_time",
          },
        });

        //should fix first sign in but no conncected pages
        if (pages.results.length < 1) {
          return console.log("no pages found");
        }

        //put all pages.results id's into an array where page.parent.type is workspace
        const workspaces = pages.results.filter(
          (page: any) => page.parent.type === "workspace"
        );

        // extract the id's from the workspaces array
        const workspaceIds = workspaces.map((workspace: any) => workspace.id);
        //extract all index_page from the userData.sites array
        const indexPages = userData.sites.map((site: any) => site.index_page);
        // check if workspaces array is the same as the indexPages array
        let result = workspaceIds.every(function (element: any) {
          return indexPages.includes(element);
        });
        //get all workspaces that are not in the indexPages array
        const newWorkspaces = workspaces.filter(
          (workspace: any) => !indexPages.includes(workspace.id)
        );

        if (result) {
          // if they are the same then redirect to the account page you dont need to add more connected pages
          return console.log("no new pages found");
        }

        var randomWord = require("random-words");

        newWorkspaces.map(async (page: any) => {
          if (page.parent.type === "workspace") {
            //check if name is valid before saving to database
            let nameValid;
            let name = tidyName(page.properties.title.title[0].plain_text);

            while (!nameValid) {
              nameValid = await subdomainCheck(name);

              if (!nameValid) {
                let word = randomWord();
                name = [name, word].join("-");
              }
            }

            await supabaseAdmin.from("connected_pages").insert({
              user: userId,
              page_id: page.id,
              page_name: name,
              page_cover: page.cover.external.url,
            });
          }
        });

        return console.log("pages added");
      }
    }

    if (error) {
      return json({
        status: "error",
        message: error.message,
      });
    }
  }

  return json({ status: "error" });
};
