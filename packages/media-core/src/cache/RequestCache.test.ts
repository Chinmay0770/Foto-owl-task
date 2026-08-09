import {
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { RequestCache } from "./RequestCache";

describe("RequestCache", () => {
  it("returns cached values", () => {
    const cache =
      new RequestCache(1000);

    cache.set(
      "test",
      { value: 123 }
    );

    expect(
      cache.get("test")
    ).toEqual({
      value: 123,
    });
  });

  it("expires values after TTL", () => {
    vi.useFakeTimers();

    const cache =
      new RequestCache(1000);

    cache.set(
      "test",
      "hello"
    );

    expect(
      cache.get("test")
    ).toBe("hello");

    vi.advanceTimersByTime(1001);

    expect(
      cache.get("test")
    ).toBeUndefined();

    vi.useRealTimers();
  });

  it("clears all values", () => {
    const cache =
      new RequestCache(1000);

    cache.set(
      "one",
      1
    );

    cache.set(
      "two",
      2
    );

    cache.clear();

    expect(
      cache.get("one")
    ).toBeUndefined();

    expect(
      cache.get("two")
    ).toBeUndefined();
  });
});