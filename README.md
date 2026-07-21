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

The contact form sends messages to `siliconsjang@gmail.com` through the Cloudflare Email Service `EMAIL` binding. Before deployment, onboard `siliconbeest.io` to Email Sending and verify the sender `contact@siliconbeest.io` and destination address.

```sh
pnpm exec wrangler email sending enable siliconbeest.io
pnpm cf-typegen
pnpm deploy
```

Local `vite dev` does not provide Cloudflare bindings, so it can only preview the UI. Verify actual delivery with `pnpm preview` or in the deployed environment. The contact API uses a Worker Rate Limiting binding, same-origin checks, input size and format validation, and a honeypot.
