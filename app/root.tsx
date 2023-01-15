import { LinksFunction, LoaderFunction } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { CatchBoundary, Document, ErrorBoundary } from "~/lib/root";
import globalStylesUrl from "~/lib/styles/global.css";
import checkIndex from "./lib/notion/check-index";
import navData from "./lib/notion/load-nav";
import { getNotionNav } from "./lib/notion/notion-api";
import { oAuthStrategy } from "./lib/storage/auth.server";
import { supabaseAdmin } from "./lib/storage/supabase.server";
import { decryptAPIKey } from "./lib/utils/encrypt-api-key";

export const loader: LoaderFunction = async ({ request }) => {

  const session = await oAuthStrategy.checkSession(request);
  const { data }: any = await checkIndex(request, session);

  let navItems = data && data.nav_links || null;
  let loggedIn = session ? true : false;

  if (navItems) {
    return {
      loggedIn,
      navItems,
      data,
      env: {
        SUPABASE_URL: process.env.SUPABASE_URL,
        SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY
      }
    }
  }

  if (data) {
    const decryptedToken = await decryptAPIKey(data.users.notion_token.toString())
    const { nav } = await getNotionNav(data.index_page, decryptedToken)
    navItems = await navData(nav)

    if (!data.nav_links) {
      await supabaseAdmin
        .from('sites')
        .update({ nav_links: navItems })
        .match({ site_name: data.site_name })
    }
  }

  return {
    loggedIn,
    navItems,
    data,
    env: {
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY
    }
  };
};

export const links: LinksFunction = () => {
  return [
    { rel: "stylesheet", href: globalStylesUrl },
  ];
};

const App = () => {

  const { env, navItems, data, loggedIn } = useLoaderData();

  return (
    <Document env={env} navItems={navItems} siteData={data} session={loggedIn}>
      <Outlet />
    </Document>
  );
};

export { ErrorBoundary, CatchBoundary };

export default App;
