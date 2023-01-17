import { PinoSentry } from "../src/index";
import { Breadcrumb, NodeClient } from "@sentry/node";
import pino, { Logger } from "pino";
import { createTransport, Hub } from "@sentry/core";
import { resolvedSyncPromise } from "@sentry/utils";
import { NodeClientOptions } from "@sentry/node/types/types";
import * as sentryCore from "@sentry/core";

function getDefaultNodeClientOptions(
  options: Partial<NodeClientOptions> = {},
): NodeClientOptions {
  return {
    integrations: [],
    transport: () =>
      createTransport({ recordDroppedEvent: () => undefined }, (_) =>
        resolvedSyncPromise({})
      ),
    stackParser: () => [],
    instrumenter: "sentry",
    ...options,
  };
}

const SENTRY_DSN = "https://00000000000000000000000000000000@sentry.io/4291";


describe("integration test", () => {
  let hub: Hub;
  let client: NodeClient;
  let breadcrumbs: Breadcrumb[] | null = [];
  let logger: Logger;

  beforeEach(() => {
    logger = pino();
    client = new NodeClient(
      getDefaultNodeClientOptions(
        {
          beforeSend: (event) => {
            if (event.breadcrumbs) {
              breadcrumbs = event.breadcrumbs;
            }
            return null;
          },
          dsn: SENTRY_DSN,
        },
      )
    );
    hub = new Hub(client);
    sentryCore.makeMain(hub);
    client.addIntegration(new PinoSentry(logger));
  });
  it("all different log levels should work", async () => {
    logger.debug({ data: "debug" }, "debug message");
    logger.info({ data: "info" }, "info message");
    logger.warn({ data: "warn" }, "warn message");
    logger.error({ data: "error" }, "error message");
    logger.fatal({ data: "fatal" }, "fatal message");
    hub.captureException(new Error("Here comes the error"));
    const codes = {
      0: "debug",
      1: "info",
      2: "warn",
      3: "error",
      4: "fatal",
    };

    if (Array.isArray(breadcrumbs)) {
      expect(breadcrumbs.length).toBe(5);

      for (let i = 0; i < 5; i++) {
        expect(breadcrumbs[i].level).toBe(i == 2 ? "warning" : codes[i]);
        expect(breadcrumbs[i].message).toBe(codes[i] + " message");
        expect(breadcrumbs[i].data).toStrictEqual({ data: codes[i] });
      }
    }
  });
});
