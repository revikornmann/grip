---
name: setup-muka
description: Set up a consumer repo to use Muka UI from npm — install the package, wire up the auto-update workflow, and register as a consumer.
disable-model-invocation: true
argument-hint: "[brand]"
---

# Set up Muka UI in this repo

Configure the current repo to consume the **public npm package**
`@revikornmann/muka-ui` and stay current with releases automatically. The
optional `$ARGUMENTS` is the brand to theme with (e.g. `fscl`, `grip`,
`bouwflow`); default brand is `muka`.

Muka UI is a public npm package — **no `.npmrc`, registry config, or auth token
is required**. When the package is installed, the version-locked copy of these
steps lives at
`node_modules/@revikornmann/muka-ui/docs/consumers/setup-instructions.md`; read
it and prefer it when present, since it always matches the installed version.

## Step 1: Install the package

If a previous git dependency exists (e.g.
`"@revikornmann/muka-ui": "github:revikornmann/muka#<sha>"`), it is replaced by
the install below.

```bash
npm install @revikornmann/muka-ui@latest --save
```

Confirm it resolved from npmjs (not a git URL):

```bash
npm ls @revikornmann/muka-ui
```

## Step 2: Import styles and components

In the app's root/entry, import the stylesheet once, then components anywhere:

```ts
import '@revikornmann/muka-ui/styles';
import { Button, Card, Input } from '@revikornmann/muka-ui';
```

For a brand theme, also import the brand token CSS and set the data attributes.
Replace `<brand>` with `$ARGUMENTS` (or `muka`) and pick `light`/`dark`:

```ts
import '@revikornmann/muka-ui/styles/tokens-<brand>-light.css';
```

```html
<html data-brand="<brand>" data-theme="light">
```

Apps that already centralize CSS (e.g. a `src/styles/index.css`) may instead
`@import '@revikornmann/muka-ui/styles/base.css'` and the brand token CSS there.

## Step 3: Add the auto-update workflow

Copy the shipped template so this repo bumps automatically on each Muka release:

```bash
mkdir -p .github/workflows
cp node_modules/@revikornmann/muka-ui/templates/update-muka.yml \
  .github/workflows/update-muka.yml
```

The workflow listens for the `muka-released` dispatch and installs the exact
published version (manual runs install `@latest`). No secrets needed — the
package is public.

## Step 4: Register this repo as a consumer

So releases dispatch updates here, add `owner/repo` to Muka's
[`.github/consumers.txt`](https://github.com/revikornmann/muka/blob/main/.github/consumers.txt).
Open a PR against `revikornmann/muka` adding the line (skip if it is already
listed). The Muka `CONSUMER_DISPATCH_TOKEN` PAT must have **write** access to
this repo for the `repository_dispatch` to succeed.

## Verify

- `npm ls @revikornmann/muka-ui` shows a semver version resolved from npmjs.
- The app builds/type-checks and Muka components render with brand tokens.
- `.github/workflows/update-muka.yml` exists and is valid YAML.
- This repo appears in Muka's `.github/consumers.txt` (or a PR is open for it).
