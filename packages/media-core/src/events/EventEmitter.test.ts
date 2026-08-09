import {
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { EventEmitter } from "./EventEmitter";

interface TestEvents {
  message: {
    value: string;
  };

  count: {
    value: number;
  };
}

describe("EventEmitter", () => {
  it("notifies subscribers", () => {
    const emitter =
      new EventEmitter<TestEvents>();

    const listener = vi.fn();

    emitter.on("message", listener);

    emitter.emit("message", {
      value: "hello",
    });

    expect(listener).toHaveBeenCalledWith({
      value: "hello",
    });
  });

  it("supports unsubscribe", () => {
    const emitter =
      new EventEmitter<TestEvents>();

    const listener = vi.fn();

    const unsubscribe =
      emitter.on(
        "message",
        listener
      );

    unsubscribe();

    emitter.emit("message", {
      value: "hello",
    });

    expect(listener).not.toHaveBeenCalled();
  });
});