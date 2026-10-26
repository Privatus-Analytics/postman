# Privatus Analytics API for Postman

**The Privatus Analytics API, ready to run in Postman.** Simple, private website
analytics with no cookies, honest numbers, and a dashboard you understand in
seconds.

## Why Privatus Analytics

**Google Analytics is slow, confusing and hungry for data.** It sends what your
visitors do to Google. In many countries it means showing a cookie pop-up (the
box that asks visitors to accept cookies), and many people click "reject", so
you never see them. Bots pad the numbers that are left.

**Privatus Analytics fixes that.** It counts visits to your website without
cookies and never stores IP addresses. Bots are filtered out before they are
counted. Your data is never sold or shared.

What you get:

- **A dashboard you understand in seconds.** Visitors, top pages and where
  people came from, all on one screen.
- **No cookie pop-up needed for our analytics.** We set no cookies and store no
  personal data. Laws differ by country, so check your own legal advice.
- **Honest numbers.** Known bots and fake traffic are left out on every plan.
- **Try it in minutes.** Every request of the API is ready to run in Postman,
  with your token set once for the whole collection.
- **Data you own.** We never sell it or show you ads, and you can pull it out
  any time through the API.

**Start free.** The Free plan has 10,000 events a month and 3 sites, with no
card. Every new account also gets 14 days of Pro free, with no card. [Create
your account](https://privatusanalytics.com).

## What this package does

It builds the Privatus Analytics API collection for Postman, the app for trying
and testing web APIs. The collection is made from the public [OpenAPI
document](https://privatusanalytics.com/openapi.json) (a file that describes
every request of the API) and is published in the [Privatus Analytics public
workspace](https://www.postman.com/privatusanalytics-2819371/privatus-analytics-api).

- Every request of the API, in one folder per topic: stats, sites, goals,
  funnels, segments, alerts, uptime checks, status pages, experiments, exports,
  testimonials and more.
- One `token` variable signs every request, so you paste your API token once.
- A **Get started** folder that goes from a new token to your first numbers in
  four requests.
- A **Webhooks** folder with a script that checks the signature of a webhook
  delivery.

It does not add a tracking script. Your site still needs the Privatus Analytics
script to collect visits. You need a Privatus Analytics account and an API
token. There is a free plan. Sign up at https://privatusanalytics.com.

## Setup

1. In Privatus Analytics, open **Workspace settings**, then **API tokens**, and
   create a token. It starts with `pat_`.
2. Open the [public
   workspace](https://www.postman.com/privatusanalytics-2819371/privatus-analytics-api),
   fork the **Privatus Analytics API** collection and set the `token` variable
   to your token. Keep it in the Current value only.
3. In the **Get started** folder, run **List workspaces**, then **List sites**.
   They save your workspace id and your first site id in the `workspace_id`
   and `site_id` variables.
4. Then run **Visitors in the last 7 days** in the same folder.

A token works in one workspace. The API docs are at
https://privatusanalytics.com/docs/api.

## Build the collection yourself

You need Node.js.

```sh
npm install
npm run build                 # from https://privatusanalytics.com/openapi.json
node build.js ./openapi.json  # or from a local copy
```

The result is `dist/privatus-analytics.postman_collection.json`. Import it in
Postman with **Import**.

## License

MIT. See [LICENSE](LICENSE).
