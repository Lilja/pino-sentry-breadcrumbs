import { getCurrentHub } from "@sentry/core";
import type { Integration } from "@sentry/types";
import { fill, severityLevelFromString } from "@sentry/utils";
import type { Logger, LoggerOptions, DestinationStream } from "pino";
import * as util from "util";

export const fmt = util.format;

type PinoLevels = "debug" | "info" | "log" | "warn" | "error" | "fatal";

const levels: PinoLevels[] = [
  "debug",
  "info",
  "log",
  "warn",
  "error",
  "fatal",
];

export class PinoSentry implements Integration {
  /**
   * Creates a pino logger integration that will add breadcrums of the pino logs.
   *
   * @param logger - Your application's Pino logger.
   */
  constructor(
    private readonly logger: Logger<LoggerOptions | DestinationStream>
  ) {}
  /**
   * @inheritDoc
   */
  public static id: string = "Pino";

  /**
   * @inheritDoc
   */
  public name: string = PinoSentry.id;

  /**
   * @inheritDoc
   */
  public setupOnce(): void {
    console.log("setupOnce")
    for (const level of levels) {
      fill(this.logger, level, createPinoWrapper(level));
    }
  }
}

function createPinoWrapper(
  level: PinoLevels
): (originalPinoMethod: () => void) => void {
  return function wrapper(originalPinoMethod: () => void): () => void {
    const sentryLevel = severityLevelFromString(level);

    /* eslint-disable prefer-rest-params */
    return function (this: Logger<LoggerOptions | DestinationStream>): void {
      const inputsOfFunctionCall = deducePinoLoggerArguments(arguments);
      if (getCurrentHub().getIntegration(PinoSentry)) {
        getCurrentHub().addBreadcrumb(
          {
            category: PinoSentry.id,
            level: sentryLevel,
            message: inputsOfFunctionCall.message,
            data: inputsOfFunctionCall.data ? inputsOfFunctionCall.data : undefined,
          },
          {
            input: [...arguments],
            level,
          }
        );
      }

      // Call the pino logger
      originalPinoMethod.apply(this, arguments as any);
    };
    /* eslint-enable prefer-rest-params */
  };
}

/*
  * Tries to be clever and seperate data from the logger message.
  *
  * Because in pino you do `logger.info({data}, "message")`, it would be nice if
  * the data portion could be added to the data property of the breadcrumb.
  */
export function deducePinoLoggerArguments(args: IArguments) {
    if (args.length > 1) {
        // https://github.com/pinojs/pino/blob/master/docs/api.md#interpolationvalues-any
      if (args.length == 2) {
        const [a, b] = args;
        if (typeof a === "string" && typeof b === "string") {
          return {
            data: null,
            message: a,
          }

        } else if (Array.isArray(a) || typeof a === 'object') {
          return {
            data: a,
            message: b,
          };
        } else {
          return {
            data: null,
            message: a,
          };
        }
      }
      return {
        data: null,
        message: args[0],
      }
    } else {
      return {
        data: null,
        message: args[0],
      }
    }
}