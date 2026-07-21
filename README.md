# SiliconBeest Project Hub

The SvelteKit project hub for SiliconBeest, with installation, development, operations, architecture, federation, and security documentation.

## Development

```sh
pnpm install
pnpm dev
```

## Validation

```sh
pnpm validate:instances
pnpm check
pnpm build
```

Cloudflare Workers deployment settings are defined in `wrangler.jsonc`.

## Instance registry

`instance.json` is the single source of truth for the public instance directory and the `/instance.json` endpoint. Entries are checked by `instance.schema.json` and `scripts/validate-instances.mjs`.

To list an instance, fork this repository, add one entry to `instance.json`, run `pnpm validate:instances`, and open a pull request using the instance checklist. The `Validate instance registry` workflow checks the registry, type-checks the site, and builds every relevant pull request.

## Contact email setup

The contact form sends messages to `siliconsjang@gmail.com` over SMTP using [worker-mailer](https://github.com/zou-yu/worker-mailer). Configure the SMTP server as Worker secrets before deployment (use port 587 with STARTTLS or 465 with implicit TLS — Cloudflare Workers cannot connect on port 25):

```sh
pnpm exec wrangler secret put SMTP_HOST
pnpm exec wrangler secret put SMTP_PORT
pnpm exec wrangler secret put SMTP_USERNAME
pnpm exec wrangler secret put SMTP_PASSWORD
pnpm cf-typegen
pnpm deploy
```

For local development, copy `.dev.vars.example` to `.dev.vars` and fill in real credentials. Local `vite dev` does not provide Cloudflare bindings, so it can only preview the UI. Verify actual delivery with `pnpm preview` or in the deployed environment. The contact API uses a Worker Rate Limiting binding, same-origin checks, input size and format validation, and a honeypot.
