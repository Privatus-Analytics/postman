#!/usr/bin/env node
'use strict';

// Builds dist/privatus-analytics.postman_collection.json from the API's
// OpenAPI document, for the Postman Public API Network.
//
//   node build.js                                   # production /openapi.json
//   node build.js ./openapi.json                    # a local copy
//
// On top of the plain conversion it sets collection-level Bearer auth
// with a {{token}} variable, gives the path variables collection-level
// values, adds a "Get started" folder and a "Webhooks" folder with a
// script that checks a delivery's signature.

const fs = require('fs');
const path = require('path');
const Converter = require('openapi-to-postmanv2');

const source = process.argv[2] || 'https://privatusanalytics.com/openapi.json';
const out = path.join(__dirname, 'dist', 'privatus-analytics.postman_collection.json');

const DESCRIPTION = [
  'The full REST API of [Privatus Analytics](https://privatusanalytics.com), the privacy-first, cookieless web analytics platform.',
  '',
  'Read stats (aggregate, time series, breakdowns, live visitors), manage sites, goals, funnels, segments, alerts, uptime checks, status pages, experiments, exports and testimonials, and subscribe to signed webhooks.',
  '',
  '## Get started',
  '',
  '1. In Privatus Analytics, open **Workspace settings → API tokens** and create a token (`pat_...`).',
  '2. Fork this collection and set the `token` variable to it.',
  '3. Run **Get started → List workspaces**, then **List sites**. Copy a site ID (`pa_...`) into the `site_id` variable.',
  '4. Run **Get started → Visitors in the last 7 days**.',
  '',
  'A token works in one workspace. JSON responses are `{ "data": ..., "meta": ... }` and errors are `{ "error": { "code", "message", "details" } }`.',
  '',
  'Docs: [privatusanalytics.com/docs/api](https://privatusanalytics.com/docs/api). OpenAPI: [privatusanalytics.com/openapi.json](https://privatusanalytics.com/openapi.json). Support: hello@privatusanalytics.com.',
].join('\n');

const VARIABLES = [
  { key: 'baseUrl', value: 'https://privatusanalytics.com', description: 'The API host.' },
  { key: 'token', value: '', description: 'Your API token (pat_...). Keep it in the Current value only.' },
  { key: 'workspace_id', value: '', description: 'Your workspace ID (ws_...), from List workspaces.' },
  { key: 'site_id', value: '', description: 'A site ID (pa_...), from List sites.' },
  { key: 'webhook_secret', value: '', description: 'A webhook signing secret (whsec_...), for the signature check.' },
];

const load = async () => {
  if (/^https?:\/\//.test(source)) {
    const response = await fetch(source, { headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error(`${source} responded with ${response.status}`);
    return response.text();
  }
  return fs.readFileSync(source, 'utf8');
};

const convert = (spec) =>
  new Promise((resolve, reject) => {
    Converter.convert(
      { type: 'string', data: spec },
      { folderStrategy: 'Tags', requestParametersResolution: 'Example', exampleParametersResolution: 'Example' },
      (err, result) => {
        if (err) return reject(err);
        if (!result.result) return reject(new Error(result.reason));
        return resolve(result.output[0].data);
      }
    );
  });

const request = (name, method, urlPath, { query = [], body, description } = {}) => {
  const segments = urlPath.replace(/^\//, '').split('/');
  return {
    name,
    request: {
      method,
      description,
      header: [{ key: 'Accept', value: 'application/json' }],
      url: {
        raw: `{{baseUrl}}${urlPath}${query.length ? `?${query.map((q) => `${q.key}=${q.value}`).join('&')}` : ''}`,
        host: ['{{baseUrl}}'],
        path: segments,
        query,
      },
      ...(body ? { body: { mode: 'raw', raw: JSON.stringify(body, null, 2), options: { raw: { language: 'json' } } } } : {}),
    },
  };
};

// Stores the first workspace and site in the collection variables.
const saveFirst = (variable) => ({
  listen: 'test',
  script: {
    type: 'text/javascript',
    exec: [
      'const body = pm.response.json();',
      'pm.test("responds with 200", () => pm.response.to.have.status(200));',
      `if (body.data && body.data[0]) pm.collectionVariables.set("${variable}", body.data[0].id);`,
    ],
  },
});

const GET_STARTED = {
  name: 'Get started',
  description: 'Four requests from a new token to your first numbers. Set the `token` variable first.',
  item: [
    { ...request('List workspaces', 'GET', '/workspaces.json', { description: 'The workspace this token belongs to. Saves its ID in `workspace_id`.' }), event: [saveFirst('workspace_id')] },
    { ...request('List sites', 'GET', '/workspaces/{{workspace_id}}/sites.json', { description: 'Sites of the workspace. Saves the first ID in `site_id`.' }), event: [saveFirst('site_id')] },
    request('Visitors in the last 7 days', 'GET', '/sites/{{site_id}}/stats/aggregate.json', {
      query: [{ key: 'period', value: '7d' }, { key: 'compare', value: 'previous_period' }],
      description: 'Visitors, visits, pageviews, bounce rate, visit duration and revenue, with the change from the previous 7 days.',
    }),
    request('Top pages this month', 'GET', '/sites/{{site_id}}/breakdown/page.json', {
      query: [{ key: 'period', value: 'mtd' }, { key: 'limit', value: '10' }],
      description: 'Any dimension works in place of page: channel, referrer, utm_campaign, country, device, browser, event, goal or prop:<key>.',
    }),
  ],
};

const VERIFY = [
  '// Paste a delivery\'s raw body and Privatus-Signature header into the',
  '// variables below to check it the way your endpoint should.',
  'const secret = pm.collectionVariables.get("webhook_secret");',
  'const header = pm.variables.get("signature_header") || "";',
  'const body = pm.variables.get("raw_body") || "";',
  'const parts = Object.fromEntries(header.split(",").map((p) => p.split("=")));',
  'const expected = CryptoJS.HmacSHA256(`${parts.t}.${body}`, secret).toString(CryptoJS.enc.Hex);',
  'const fresh = Math.abs(Date.now() / 1000 - Number(parts.t)) < 300;',
  'console.log(expected === parts.v1 && fresh ? "Signature is valid" : "Signature is NOT valid");',
];

const WEBHOOKS = {
  name: 'Webhooks',
  description:
    'Signed webhooks for 25 events (alerts, uptime, sites, members, exports, audits, experiments and testimonials). Each delivery carries `Privatus-Signature: t=<unix time>,v1=<hex>`, the HMAC-SHA256 of `"<t>.<raw body>"` with the signing secret. See [Webhooks](https://privatusanalytics.com/docs/api/webhooks).',
  item: [
    request('Add a webhook endpoint', 'POST', '/workspaces/{{workspace_id}}/webhooks.json', {
      body: { url: 'https://example.com/hooks/privatus', events: ['testimonial.received', 'uptime.down'], enabled: true },
      description: 'Returns the endpoint with its signing secret (`whsec_...`). Needs the workspace settings permission.',
    }),
    request('Send a test delivery', 'POST', '/workspaces/{{workspace_id}}/webhooks/{{webhook_id}}/test.json', {
      description: 'Sends a `webhook.test` event to the endpoint.',
    }),
    {
      ...request('Check a signature (no request sent)', 'GET', '/workspaces.json', {
        description: 'Runs the signature check in the pre-request script. Set `webhook_secret`, then `signature_header` and `raw_body` as environment or local variables.',
      }),
      event: [{ listen: 'prerequest', script: { type: 'text/javascript', exec: VERIFY } }],
    },
  ],
};

const main = async () => {
  const collection = await convert(await load());
  collection.info.name = 'Privatus Analytics API';
  collection.info.description = DESCRIPTION;
  collection.auth = { type: 'bearer', bearer: [{ key: 'token', value: '{{token}}', type: 'string' }] };
  // Path variables keep their own values per request. The ones every
  // reader sets once live at the collection level.
  collection.variable = VARIABLES;
  collection.item = [GET_STARTED, WEBHOOKS, ...collection.item];

  // The converter names the token {{bearerToken}} on some requests.
  const text = JSON.stringify(collection).replace(/\{\{bearerToken\}\}/g, '{{token}}');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, text);
  const count = (items) => items.reduce((n, item) => n + (item.item ? count(item.item) : 1), 0);
  process.stdout.write(`Wrote ${count(collection.item)} requests in ${collection.item.length} folders to ${path.relative(process.cwd(), out)}\n`);
};

main().catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exit(1);
});
