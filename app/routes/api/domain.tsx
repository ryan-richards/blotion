import { ActionFunction, json, redirect } from "@remix-run/node";
import { HttpMethod } from "~/lib/@types/http";
import { createDomain, deleteDomain } from "~/lib/domains/domain";

export const action: ActionFunction = async ({ request }) => {
  //action fuction to create a new domain using vercel API
  switch (request.method) {
    case HttpMethod.POST:
      const resCreate = await createDomain(request);
      return json({ status: resCreate.status });
    case HttpMethod.DELETE:
      const resDelete = await deleteDomain(request);
      return json({ status: resDelete.status });
    default:
      return json({
        status: "error",
        message: "Invalid request",
      });
  }
};
