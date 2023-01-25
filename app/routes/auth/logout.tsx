import { ActionFunction } from "@remix-run/node";
import { authenticator } from "~/lib/storage/auth.server";

export const action: ActionFunction = async ({ request }) => {
  await authenticator.logout(request, { redirectTo: "/" });
};
