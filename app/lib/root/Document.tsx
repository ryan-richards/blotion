import { withEmotionCache } from "@emotion/react";
import {
  Links,
  LiveReload,
  Meta,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import React from "react";

import Providers from "./Providers";

import Layout from "~/lib/layout";
import ClientStyleContext from "~/lib/styles/context.client";
import ServerStyleContext from "~/lib/styles/context.server";
import Header from "../layout/Header";
import HomeFooter from "../layout/HomeFooter";



type DocumentProps = {
  children: React.ReactNode;
  title?: string;
  env?: any;
  navItems?: any;
  siteData?: any;
  session?: any;
};

const Document = withEmotionCache(
  ({ children, title, env, navItems, siteData, session }: DocumentProps, emotionCache) => {
    const serverStyles = React.useContext(ServerStyleContext);
    const clientStyles = React.useContext(ClientStyleContext);

    // ref: https://github.com/mui-org/material-ui/issues/30436#issuecomment-1003339715
    React.useEffect(() => {
      // eslint-disable-next-line no-param-reassign
      emotionCache.sheet.container = document.head;

      const { tags } = emotionCache.sheet;
      emotionCache.sheet.flush();
      tags.forEach((tag) => {
        // eslint-disable-next-line no-underscore-dangle, @typescript-eslint/no-explicit-any
        (emotionCache.sheet as any)._insertTag(tag);
      });
      clientStyles.reset();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
      <html lang="en">
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width,initial-scale=1" />
          {title ? <title>{title}</title> : null}
          <Meta />
          <Links />
          {serverStyles?.map((style) => (
            <style
              data-emotion={`${style.key} ${style.ids.join(" ")}`}
              key={style.key}
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{ __html: style.css }}
            />
          ))}
          {process.env.NODE_ENV === "development" ? null :
            <script async defer data-website-id="efc7fae6-1355-438a-8795-907f1bd3c7ef" src="https://umami-one-tan.vercel.app/umami.js"></script>}
        </head>
        <body>
          <Providers>
            {!navItems ? <Header session={session} /> : null}
            <Layout navItems={navItems} siteData={siteData}>
              {children}
            </Layout>
            {!siteData ? <HomeFooter /> : null}
          </Providers>
          <ScrollRestoration />
          <script
            dangerouslySetInnerHTML={{
              __html: `window.env = ${JSON.stringify(env)}`
            }}
          />
          <Scripts />
          {process.env.NODE_ENV === "development" && <LiveReload />}
        </body>
      </html>
    );
  }
);

export default Document;
