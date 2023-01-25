import { ActionFunction, json } from "@remix-run/node";
import { HttpMethod } from "~/lib/@types/http";

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const domain = formData.get("domain");

  if (Array.isArray(domain))
    return json({
      status: "400",
      message: "domain must be string",
    });

  try {
    const response = await fetch(
      `https://api.vercel.com/v6/domains/${domain}/config`,
      {
        method: HttpMethod.GET,
        headers: {
          Authorization: `Bearer ${process.env.AUTH_BEARER_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();
    const valid = data?.configuredBy ? true : false;
    return json({ status: 200, valid });
  } catch (error) {
    console.error(error);
    return json({ status: 500, error });
  }
};
