import { ActionFunction, json } from "@remix-run/node";

export const action: ActionFunction = async ({ request }) => {

    const data = await request.json();
    const sig = request.headers.get('user-agent');
    console.log(data)

    if (sig !== 'Postmark' || !sig) return json({ status: 'invalid webhook signature' });

    if (!data) return json({ status: 'no data' });

    switch (data.RecordType) {
        case 'Delivery':
            console.log('Delivery')

            switch (data.Tag) {
                case 'welcome':
                    console.log('Welcome email was delivered to ' + data.Recipient)
                    // insert user to the email drip table
                    // cron job runs every 2 hours and sends the next email in the drip
                    break;
                default:
                    console.log('Unknown tag')
                    break;
            }


            break;
        case 'Bounce':
            console.log('Bounce');
            break;
        case 'SpamComplaint':
            console.log('Spam');
            break;
        case 'SubscriptionChange':
            console.log('Subscription');
            break;
        default:
            console.log('Unknown');
            break;
    }

    return json({ status: 'success' });
};