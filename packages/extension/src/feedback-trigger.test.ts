import { describe, it, expect, vi, afterEach } from "vitest";
import {
  klavContentSig,
  shouldCapture,
  createTrailingDebounce,
  DEBOUNCE_MS,
  DEBOUNCE_MAX_WAIT_MS,
  ROUTE_COOLDOWN_MS,
  MAX_REVIEWS_PER_ROUTE,
  CAPTURE_BACKOFF_MS,
  CAPTURE_MAX_RETRIES,
} from "./feedback-trigger";

// ---------------------------------------------------------------------------
// klavContentSig
// ---------------------------------------------------------------------------

const BASE_INPUT = {
  host: "example.com",
  title: "Hello World",
  counts: { headings: 3, buttons: 2, links: 10, fields: 1 },
  region: "h:3|b:2|l:10|f:1",
};

describe("klavContentSig", () => {
  it("is deterministic — same input produces same sig", () => {
    expect(klavContentSig(BASE_INPUT)).toBe(klavContentSig({ ...BASE_INPUT }));
  });

  it("is stable across independent calls", () => {
    const a = klavContentSig(BASE_INPUT);
    const b = klavContentSig(BASE_INPUT);
    const c = klavContentSig(BASE_INPUT);
    expect(a).toBe(b);
    expect(b).toBe(c);
  });

  it("starts with the host as a prefix", () => {
    const sig = klavContentSig(BASE_INPUT);
    expect(sig.startsWith("example.com")).toBe(true);
  });

  it("differs when host changes", () => {
    const a = klavContentSig(BASE_INPUT);
    const b = klavContentSig({ ...BASE_INPUT, host: "other.com" });
    expect(a).not.toBe(b);
  });

  it("differs when title changes", () => {
    const a = klavContentSig(BASE_INPUT);
    const b = klavContentSig({ ...BASE_INPUT, title: "Different Title" });
    expect(a).not.toBe(b);
  });

  it("normalizes title to ≤80 chars — long titles that share the first 80 chars produce the same sig", () => {
    const longTitle = "A".repeat(200);
    const samePrefix = "A".repeat(300);
    const a = klavContentSig({ ...BASE_INPUT, title: longTitle });
    const b = klavContentSig({ ...BASE_INPUT, title: samePrefix });
    expect(a).toBe(b);
  });

  it("differs when two titles differ within the first 80 chars", () => {
    const t1 = "Alpha" + "X".repeat(100);
    const t2 = "Beta" + "X".repeat(100);
    const a = klavContentSig({ ...BASE_INPUT, title: t1 });
    const b = klavContentSig({ ...BASE_INPUT, title: t2 });
    expect(a).not.toBe(b);
  });

  it("differs when headings count changes", () => {
    const a = klavContentSig(BASE_INPUT);
    const b = klavContentSig({
      ...BASE_INPUT,
      counts: { ...BASE_INPUT.counts, headings: 99 },
    });
    expect(a).not.toBe(b);
  });

  it("differs when buttons count changes", () => {
    const a = klavContentSig(BASE_INPUT);
    const b = klavContentSig({
      ...BASE_INPUT,
      counts: { ...BASE_INPUT.counts, buttons: 99 },
    });
    expect(a).not.toBe(b);
  });

  it("differs when links count changes", () => {
    const a = klavContentSig(BASE_INPUT);
    const b = klavContentSig({
      ...BASE_INPUT,
      counts: { ...BASE_INPUT.counts, links: 99 },
    });
    expect(a).not.toBe(b);
  });

  it("differs when fields count changes", () => {
    const a = klavContentSig(BASE_INPUT);
    const b = klavContentSig({
      ...BASE_INPUT,
      counts: { ...BASE_INPUT.counts, fields: 99 },
    });
    expect(a).not.toBe(b);
  });

  it("differs when region fingerprint changes", () => {
    const a = klavContentSig(BASE_INPUT);
    const b = klavContentSig({ ...BASE_INPUT, region: "h:1|b:0|l:5|f:0" });
    expect(a).not.toBe(b);
  });

  it("cross-host discrimination: same path/title/counts differ by host", () => {
    const a = klavContentSig({ ...BASE_INPUT, host: "app.alpha.com" });
    const b = klavContentSig({ ...BASE_INPUT, host: "app.beta.com" });
    expect(a).not.toBe(b);
  });

  it("returns a non-empty string", () => {
    expect(typeof klavContentSig(BASE_INPUT)).toBe("string");
    expect(klavContentSig(BASE_INPUT).length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// shouldCapture
// ---------------------------------------------------------------------------

const NOW = 1_700_000_000_000;
const BASE_STATE = {
  nowSig: "sig-A",
  lastSentSig: null,
  now: NOW,
  cooldownUntil: NOW - 1,
  paused: false,
  routeCount: 0,
  cap: MAX_REVIEWS_PER_ROUTE,
};

describe("shouldCapture", () => {
  it("returns capture:true, reason:'ok' when all conditions are met", () => {
    expect(shouldCapture(BASE_STATE)).toEqual({ capture: true, reason: "ok" });
  });

  it("returns capture:false, reason:'unchanged' when sig equals lastSentSig", () => {
    expect(
      shouldCapture({ ...BASE_STATE, lastSentSig: "sig-A", nowSig: "sig-A" })
    ).toEqual({ capture: false, reason: "unchanged" });
  });

  it("returns capture:true when sig differs even if lastSentSig was set", () => {
    expect(
      shouldCapture({ ...BASE_STATE, lastSentSig: "sig-OLD", nowSig: "sig-NEW" })
    ).toEqual({ capture: true, reason: "ok" });
  });

  it("returns capture:false, reason:'cooldown' when now < cooldownUntil", () => {
    expect(
      shouldCapture({ ...BASE_STATE, cooldownUntil: NOW + 5000 })
    ).toEqual({ capture: false, reason: "cooldown" });
  });

  it("returns capture:true when now === cooldownUntil (boundary: not in cooldown)", () => {
    expect(
      shouldCapture({ ...BASE_STATE, cooldownUntil: NOW })
    ).toEqual({ capture: true, reason: "ok" });
  });

  it("returns capture:false, reason:'paused' when paused=true", () => {
    expect(shouldCapture({ ...BASE_STATE, paused: true })).toEqual({
      capture: false,
      reason: "paused",
    });
  });

  it("returns capture:false, reason:'cap' when routeCount >= cap", () => {
    expect(
      shouldCapture({ ...BASE_STATE, routeCount: MAX_REVIEWS_PER_ROUTE, cap: MAX_REVIEWS_PER_ROUTE })
    ).toEqual({ capture: false, reason: "cap" });
  });

  it("returns capture:false, reason:'cap' when routeCount > cap", () => {
    expect(
      shouldCapture({
        ...BASE_STATE,
        routeCount: MAX_REVIEWS_PER_ROUTE + 1,
        cap: MAX_REVIEWS_PER_ROUTE,
      })
    ).toEqual({ capture: false, reason: "cap" });
  });

  it("returns capture:true when routeCount is one below cap", () => {
    expect(
      shouldCapture({
        ...BASE_STATE,
        routeCount: MAX_REVIEWS_PER_ROUTE - 1,
        cap: MAX_REVIEWS_PER_ROUTE,
      })
    ).toEqual({ capture: true, reason: "ok" });
  });

  // Priority / ordering: 'unchanged' checked before cooldown
  it("'unchanged' takes priority over 'cooldown'", () => {
    const result = shouldCapture({
      ...BASE_STATE,
      nowSig: "sig-A",
      lastSentSig: "sig-A",
      cooldownUntil: NOW + 9999,
    });
    expect(result).toEqual({ capture: false, reason: "unchanged" });
  });

  // Priority: 'paused' checked before 'cap'
  it("'paused' takes priority over 'cap'", () => {
    const result = shouldCapture({
      ...BASE_STATE,
      paused: true,
      routeCount: MAX_REVIEWS_PER_ROUTE + 10,
    });
    expect(result).toEqual({ capture: false, reason: "paused" });
  });

  it("lastSentSig=null does NOT block capture (first capture ever)", () => {
    expect(shouldCapture({ ...BASE_STATE, lastSentSig: null })).toEqual({
      capture: true,
      reason: "ok",
    });
  });

  it("cap=0 always blocks (edge case)", () => {
    expect(
      shouldCapture({ ...BASE_STATE, routeCount: 0, cap: 0 })
    ).toEqual({ capture: false, reason: "cap" });
  });
});

// ---------------------------------------------------------------------------
// Exported consts sanity checks
// ---------------------------------------------------------------------------

describe("exported consts", () => {
  it("DEBOUNCE_MS is 1000", () => {
    expect(DEBOUNCE_MS).toBe(1000);
  });

  it("DEBOUNCE_MAX_WAIT_MS is 3500", () => {
    expect(DEBOUNCE_MAX_WAIT_MS).toBe(3500);
  });

  it("ROUTE_COOLDOWN_MS is 8000", () => {
    expect(ROUTE_COOLDOWN_MS).toBe(8000);
  });

  it("MAX_REVIEWS_PER_ROUTE is 6", () => {
    expect(MAX_REVIEWS_PER_ROUTE).toBe(6);
  });

  it("CAPTURE_BACKOFF_MS is positive and > Chrome rate-limit window (~500ms)", () => {
    expect(CAPTURE_BACKOFF_MS).toBeGreaterThan(500);
  });

  it("CAPTURE_MAX_RETRIES is between 1 and 4 (enough retries but not runaway)", () => {
    expect(CAPTURE_MAX_RETRIES).toBeGreaterThanOrEqual(1);
    expect(CAPTURE_MAX_RETRIES).toBeLessThanOrEqual(4);
  });
});

// ---------------------------------------------------------------------------
// createTrailingDebounce — trailing-edge debounce (fixes the throttle ~2s bug)
// ---------------------------------------------------------------------------

describe("createTrailingDebounce", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("fires once, delayMs after the LAST schedule() — not on a fixed grid", () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const d = createTrailingDebounce(fn, 1000);

    // A burst of "mutations" 300ms apart over 1.2s (a settling stream).
    d.schedule();
    vi.advanceTimersByTime(300);
    d.schedule();
    vi.advanceTimersByTime(300);
    d.schedule();
    vi.advanceTimersByTime(300);
    d.schedule(); // last schedule at t=900

    // The throttle bug would have fired around t=1000 mid-stream; trailing
    // debounce must NOT have fired yet (last schedule was at t=900).
    vi.advanceTimersByTime(999);
    expect(fn).not.toHaveBeenCalled();

    // Exactly delayMs after the last schedule → one fire.
    vi.advanceTimersByTime(1);
    expect(fn).toHaveBeenCalledTimes(1);

    // No further fires once settled.
    vi.advanceTimersByTime(5000);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("cancel() prevents a pending fire", () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const d = createTrailingDebounce(fn, 1000);
    d.schedule();
    vi.advanceTimersByTime(500);
    d.cancel();
    vi.advanceTimersByTime(5000);
    expect(fn).not.toHaveBeenCalled();
  });

  it("can be re-armed after firing", () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const d = createTrailingDebounce(fn, 1000);
    d.schedule();
    vi.advanceTimersByTime(1000);
    expect(fn).toHaveBeenCalledTimes(1);
    d.schedule();
    vi.advanceTimersByTime(1000);
    expect(fn).toHaveBeenCalledTimes(2);
  });
});

// ---------------------------------------------------------------------------
// createTrailingDebounce with maxWaitMs — "never settles" page coalescing
// ---------------------------------------------------------------------------

describe("createTrailingDebounce with maxWaitMs", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("fires at maxWaitMs when mutations arrive continuously (never settles)", () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const d = createTrailingDebounce(fn, 1000, 3500);

    // Simulate a live feed: mutations every 200ms for 5 full seconds.
    // Without maxWaitMs the trailing timer keeps resetting and fn never fires.
    // With maxWaitMs=3500, fn must fire at t=3500 even while mutations continue.
    for (let t = 0; t < 5000; t += 200) {
      vi.advanceTimersByTime(200);
      d.schedule();
      if (t < 3500) {
        expect(fn).not.toHaveBeenCalled();
      }
    }
    // Should have fired exactly once at maxWaitMs.
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("fires at delayMs when page settles before maxWaitMs", () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const d = createTrailingDebounce(fn, 1000, 3500);

    // Two quick mutations, then silence — normal trailing-edge case.
    d.schedule();
    vi.advanceTimersByTime(300);
    d.schedule();      // resets trailing timer
    vi.advanceTimersByTime(999);
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);      // exactly 1000ms after last schedule
    expect(fn).toHaveBeenCalledTimes(1);
    // maxWait timer is cleared — no second fire.
    vi.advanceTimersByTime(5000);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("maxWait ceiling resets after a fire so the next burst gets a fresh window", () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const d = createTrailingDebounce(fn, 1000, 3500);

    // First burst: settles at 1000ms (before maxWait).
    d.schedule();
    vi.advanceTimersByTime(1000);
    expect(fn).toHaveBeenCalledTimes(1);

    // Second burst: continuous mutations — fire once more via maxWait ceiling.
    // Each iteration advances 200ms then schedules; first schedule is at t=1200.
    // maxWait fires at t=1200+3500=4700ms. Loop runs to t=4600ms, then we advance
    // 500ms more (to t=5100ms) to let the maxWait timer fire at t=4700ms.
    for (let t = 0; t < 3500; t += 200) {
      vi.advanceTimersByTime(200);
      d.schedule();
    }
    vi.advanceTimersByTime(500);  // push past the maxWait window (fires at 4700ms)
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("cancel() clears both the trailing timer and the maxWait ceiling", () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const d = createTrailingDebounce(fn, 1000, 3500);

    // schedule, then cancel before either timer fires
    d.schedule();
    vi.advanceTimersByTime(500);  // well before delayMs=1000 and maxWaitMs=3500
    d.cancel();
    vi.advanceTimersByTime(5000);
    expect(fn).not.toHaveBeenCalled();
  });

  it("behaves identically to no-maxWait version when maxWaitMs is undefined", () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const d = createTrailingDebounce(fn, 1000);  // no maxWait arg

    d.schedule();
    vi.advanceTimersByTime(300);
    d.schedule();
    vi.advanceTimersByTime(1000);
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
