import { ActionFunction } from "@remix-run/node";
import { json } from "remix-utils";

export const action: ActionFunction = async ({ request }) => {
    
    var raw = JSON.stringify({username:'admin',password:'admin1234'});

    let requestOptions: any = {
        method: 'POST',
        body: raw,
    };

    let token

    console.log(requestOptions)
    await fetch("https://umami-one-tan.vercel.app/api/auth/login", requestOptions)
        .then(response => console.log(response))
        .then((result) => {
            token = result
            console.log(result)
        }
        )
        .catch(error => console.log('error', error));



    return json({ status: token });
}