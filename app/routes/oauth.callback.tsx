import { ActionFunction, json, redirect } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import { useEffect } from 'react';
import { supabaseClient } from '~/lib/storage/supabase.client';
import { supabaseAdmin } from '~/lib/storage/supabase.server';
import { encryptAPIKey } from '~/lib/utils/encrypt-api-key';
import { authenticator } from '../lib/storage/auth.server';

export const action: ActionFunction = async ({ request }) => {

  const cloneRequest = request.clone()
  const formData = await cloneRequest.formData();
  const session = formData?.get('session');
  if (typeof session !== 'string') throw new Error('session not found');
  const parsed = JSON.parse(session)
  const token = parsed.provider_token

  const encryptedToken = await encryptAPIKey(token.toString())

  await authenticator.authenticate("sb-oauth", request, {
    failureRedirect: "/",
    successRedirect: `/account?token=${encryptedToken}`,
  });

  return json({ status: 'success' });
};

export default function OAuth() {
  const fetcher = useFetcher();
  useEffect(() => {
    const { data: authListener } = supabaseClient.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_IN") {
          const formData = new FormData();
          formData.append("session", JSON.stringify(session));
          fetcher.submit(formData, {
            method: "post",
          });
        }
      }
    );

    return () => {
      authListener?.unsubscribe();
    };
  }, [fetcher]);

  return null;
}