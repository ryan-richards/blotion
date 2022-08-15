import type { LinksFunction, LoaderFunction } from "@remix-run/node";
import { Outlet, useLoaderData, useNavigate } from "@remix-run/react";
import { CatchBoundary, Document, ErrorBoundary } from "~/lib/root";
import globalStylesUrl from "~/lib/styles/global.css";

export const loader: LoaderFunction = () => {
  return {
    env: {
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY
    }
  };
};

// https://remix.run/api/app#links
export const links: LinksFunction = () => {
  return [
    { rel: "stylesheet", href: globalStylesUrl },
  ];
};

const App = () => {

  const { env } = useLoaderData<Window>();

  return (
    <Document env={env}>
      <Outlet />
    </Document>
  );
};

export { ErrorBoundary, CatchBoundary };

export default App;
