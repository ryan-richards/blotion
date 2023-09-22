import { LinksFunction, LoaderFunction } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { CatchBoundary, Document, ErrorBoundary } from "~/lib/root";
import globalStylesUrl from "~/lib/styles/global.css";
import checkIndex from "./lib/notion/check-index";
import { oAuthStrategy } from "./lib/storage/auth.server";

export const loader: LoaderFunction = async ({ request }) => {
  const session = await oAuthStrategy.checkSession(request);
  const { data }: any = await checkIndex(request, session);

  let navItems = (data && data.nav_links) || null;
  let loggedIn = session ? true : false;

  if (navItems) {
    return {
      loggedIn,
      navItems,
      data,
      env: {
        SUPABASE_URL: process.env.SUPABASE_URL,
        SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
      },
    };
  }

  return {
    loggedIn,
    navItems,
    data,
    env: {
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    },
  };
};

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: globalStylesUrl }];
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
