# Privatus Analytics API for Postman

**Try the Privatus Analytics API in Postman, with every request ready to send.**

You want to use the Privatus Analytics API, but writing each request by hand is
slow, and it is hard to know where to start.

This collection has every request of the API, sorted by topic, in Postman (the
app for trying web APIs). Paste your API token once and every request uses it.

So you go from a new token to your first numbers in four requests. The numbers
are honest too. Privatus Analytics counts visits without cookies, so there is no
cookie pop-up for your analytics, and it leaves bots out.

**Free plan, no card:** 10,000 events a month (an event is a page view or an action you track) on up to 3 sites. [Start free at privatusanalytics.com](https://privatusanalytics.com).

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
