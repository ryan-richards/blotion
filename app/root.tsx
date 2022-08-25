import { json, LinksFunction, LoaderFunction } from "@remix-run/node";
import { Outlet, useLoaderData, useNavigate } from "@remix-run/react";
import { CatchBoundary, Document, ErrorBoundary } from "~/lib/root";
import globalStylesUrl from "~/lib/styles/global.css";
import checkIndex from "./lib/notion/check-index";
import navData from "./lib/notion/load-nav";
import { getNotionNav } from "./lib/notion/notion-api";
import { oAuthStrategy } from "./lib/storage/auth.server";
import { decryptAPIKey } from "./lib/utils/encrypt-api-key";

export const loader: LoaderFunction = async ({ request, params }) => {

  const session = await oAuthStrategy.checkSession(request);
  const { data, status, preview, subdomain }: any = await checkIndex(request, session);

  let navItems = null
  if (data) {
    const decryptedToken = await decryptAPIKey(data.users.notion_token.toString())
    const { nav } = await getNotionNav(data.index_page, decryptedToken)
    navItems = await navData(nav)
    //console.log('nav items fetched from root')
  }

  let loggedIn = session ? true : false;

  return {
    loggedIn,
    navItems,
    data,
    env: {
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY
    },
    headers: {
      "Cache-Control":
        "s-maxage=60, stale-while-revalidate=3600",
    }
  };
};

export function headers({ loaderHeaders }: { loaderHeaders: Headers }) {
  return {
    "cache-control": loaderHeaders.get("cache-control"),
  };
}

export const links: LinksFunction = () => {
  return [
    { rel: "stylesheet", href: globalStylesUrl},
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
