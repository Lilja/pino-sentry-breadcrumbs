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
  it("#1", async () => {
    //sentryCore.getCurrentHub().bindClient(client);
    logger.info({ data: { someData: "yes!" } }, "Log message");
    hub.captureException(new Error("Here comes the error"));
    expect(breadcrumbs).not.toBeNull();

    // Because expect() doesn't have typeguards...
    if (Array.isArray(breadcrumbs)) {
      let bc: Breadcrumb[] = breadcrumbs;
      expect(bc.length).toBe(1);
      expect(bc[0].category).toBe("Pino");
      expect(bc[0].level).toBe("info");
      expect(bc[0].data).toStrictEqual({ data: { someData: "yes!" } });
    }
  });
});
