import { deducePinoLoggerArguments } from "../src";

const logger = {
  info: function(..._args: unknown[]) {
    return deducePinoLoggerArguments(arguments);
  }
};

describe('deducePinoLoggerArguments', () => {
  it('basic #1', () => {
    const obj = logger.info("Log message");
    expect(obj.message).toBe("Log message");
    expect(obj.data).toBeNull();
  });
  it('basic #2', () => {
    const obj = logger.info({data: {"someData": "yes!"}}, "Log message");
    expect(obj.message).toBe("Log message");
    expect(obj.data).toStrictEqual({data: {"someData": "yes!"}});
  });
  it('basic #3', () => {
    const obj = logger.info(["args"], "Log message");
    expect(obj.message).toBe("Log message");
    expect(obj.data).toStrictEqual(["args"]);
  });
});
