# Crilli website

Next.js (App Router) storefront and [Payload CMS 3](https://payloadcms.com/) admin, with Vercel Postgres, Vercel Blob media, Stripe checkout, and the Payload ecommerce plugin.

## Local development

1. Install dependencies: `pnpm install`
2. Create a `.env` file in the project root (see [Environment variables](#environment-variables) below).
3. Run `pnpm dev` and open `http://localhost:3000`.
4. Access the admin UI (Payload) at the `/admin` path and create the first user when prompted.

## Environment variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `PAYLOAD_SECRET` | Yes | Payload encryption / auth secret |
| `DATABASE_URL` | Yes | Vercel Postgres (or compatible Postgres) connection string |
| `BLOB_READ_WRITE_TOKEN` | Yes (media uploads) | Vercel Blob read/write token |
| `NEXT_PUBLIC_SITE_URL` | Yes (checkout) | Public site URL for Stripe redirect URLs |
| `STRIPE_SECRET_KEY` | Yes (payments) | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Yes (webhooks) | Stripe webhook signing secret |
| `NEXT_PUBLIC_SERVER_URL` | Dev utility | Base URL for `fix-images` route (non-production) |
| `INKTHREADABLE_ENABLED` | Optional | Set to `true` to submit paid orders to Inkthreadable from the Stripe webhook |
| `INKTHREADABLE_*` | Optional | Inkthreadable API configuration (see `src/lib/inkthreadable.ts`) |
| `SENDER_NET_API_KEY` | Optional | Sender.net API key for transactional email |
| `SENDER_CAMPAIGN_ID` | Optional | Sender campaign id for transactional sends |
| `SENDER_USE_TEST_EMAIL` | Optional | In development, redirect sends to `SENDER_TEST_EMAIL` when `true` |
| `SENDER_TEST_EMAIL` | Optional | Test recipient when `SENDER_USE_TEST_EMAIL=true` |
| `SENDER_SUBSCRIBE_GROUP_ID` or `SENDER_SUBSCRIBE_GROUP_IDS` | Optional | Sender list group id(s) for `/api/subscribe` (comma-separated for multiple) |
| `TICKETTAILOR_API_URL` / `TICKETTAILOR_API_KEY` | Optional | TicketTailor integration |
| `KV_REST_API_URL` / `KV_REST_API_TOKEN` | Recommended (production) | Vercel KV / Upstash Redis for distributed subscribe rate limiting; without these, subscribe uses in-memory limits per server instance only |
| `VERBOSE_WEBHOOK_LOGS` | Optional | Set to `true` for extra Stripe webhook logging (avoid in production; may include PII) |

Do not commit real secrets. Use your host’s secret management (e.g. Vercel Environment Variables).

## Security notes

- **Guest carts** use a server-generated `secret` stored in the browser (`localStorage` key `cart_secret` by default). Checkout requires both `cartId` and `cartSecret` so arbitrary carts cannot be checked out without the secret.
- **Orders and addresses** exposed via Payload REST/GraphQL use the ecommerce plugin’s access rules: non-admin reads are limited to documents where `customer` matches the authenticated user (guest checkout does not expose those APIs without auth).
- **GraphQL Playground** is served from a Payload-generated route. Confirm in staging that it is disabled or acceptable for your deployment (Payload typically restricts this by environment).
- **Subscribe rate limiting**: configure KV (or equivalent) in production so limits apply across all serverless instances.

## Scripts

- `pnpm dev` — Next.js dev server  
- `pnpm build` / `pnpm start` — production build and serve  
- `pnpm lint` — ESLint  
- `pnpm payload` — Payload CLI  
- `pnpm generate:types` — regenerate `src/payload-types.ts`  

## Questions

Payload CMS: [Discord](https://discord.com/invite/payload) and [GitHub discussions](https://github.com/payloadcms/payload/discussions).
