# pino-sentry-breadcrumbs

A way to add breadcrumbs of your pino logs.

## Usage

```typescript
import {PinoSentry} from "pino-sentry-breadcrumbs"
import pino from "pino";
import {init} from "@sentry/node";

const logger = pino()
init({
  ...
  integrations: [new PinoSentry(logger)]
})
```

## Installation
`npm install pino-sentry-breadcrumbs`

`yarn add pino-sentry-breadcrumbs`

## State
Should be fully functional.
