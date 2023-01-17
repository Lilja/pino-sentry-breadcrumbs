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

## State
Should be fully functional.
