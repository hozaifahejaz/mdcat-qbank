import { describe, expect, it, vi } from "vitest";
import { type Verdict, checkIntegrity, judge, requestHash } from "../integrity";
import type { Env } from "../env";

const PKG = "com.markhorprep.app";
const KEY = "0f8fad5b-d9cb-469f-a165-70867728950e";

async function verdict(over: Partial<Verdict> = {}): Promise<Verdict> {
  return {
    requestDetails: { requestPackageName: PKG, requestHash: await requestHash("claim", KEY), timestampMillis: String(Date.now() - 1000) },
    appIntegrity: { appRecognitionVerdict: "PLAY_RECOGNIZED", packageName: PKG },
    deviceIntegrity: { deviceRecognitionVerdict: ["MEETS_DEVICE_INTEGRITY"] },
    ...over,
  };
}
const env = (mode: string) => ({ PLAY_INTEGRITY_MODE: mode, ANDROID_PACKAGE: PKG, PLAY_INTEGRITY_SA_EMAIL: "sa@x.iam.gserviceaccount.com", PLAY_INTEGRITY_SA_KEY: "k" }) as Env;
const TOKEN = "x".repeat(40);

describe("judge", () => {
  it("passes a good verdict", async () => {
    expect(judge(await verdict(), PKG, await requestHash("claim", KEY))).toBeNull();
  });
  it("fails a hash made for another action or device", async () => {
    expect(judge(await verdict(), PKG, await requestHash("pack", KEY))).toBe("wrong_hash");
    expect(judge(await verdict(), PKG, await requestHash("claim", "11111111-1111-1111-1111-111111111111"))).toBe("wrong_hash");
  });
  it("fails a stale token", async () => {
    const v = await verdict();
    v.requestDetails!.timestampMillis = String(Date.now() - 10 * 60 * 1000);
    expect(judge(v, PKG, await requestHash("claim", KEY))).toBe("stale");
  });
  it("fails an app Play doesn't recognise", async () => {
    expect(judge(await verdict({ appIntegrity: { appRecognitionVerdict: "UNRECOGNIZED_VERSION", packageName: PKG } }), PKG, await requestHash("claim", KEY))).toBe("app_not_recognised");
  });
  it("fails an emulator or rooted phone", async () => {
    expect(judge(await verdict({ deviceIntegrity: { deviceRecognitionVerdict: [] } }), PKG, await requestHash("claim", KEY))).toBe("device_not_trusted");
    expect(judge(await verdict({ deviceIntegrity: {} }), PKG, await requestHash("claim", KEY))).toBe("device_not_trusted");
  });
  it("fails another package", async () => {
    expect(judge(await verdict(), "com.other", await requestHash("claim", KEY))).toBe("wrong_package");
  });
});

describe("checkIntegrity", () => {
  it("does nothing when off", async () => {
    const decode = vi.fn();
    expect(await checkIntegrity(env("off"), { action: "claim", deviceKey: KEY, token: TOKEN }, decode)).toBe(false);
    expect(decode).not.toHaveBeenCalled();
  });
  it("passes a good token", async () => {
    const v = await verdict();
    expect(await checkIntegrity(env("enforce"), { action: "claim", deviceKey: KEY, token: TOKEN }, async () => v)).toBe(true);
  });
  it("lets a failure through in log mode and notes it", async () => {
    const noteFailure = vi.fn(async () => {});
    const v = await verdict({ deviceIntegrity: {} });
    expect(await checkIntegrity(env("log"), { action: "claim", deviceKey: KEY, token: TOKEN, noteFailure }, async () => v)).toBe(false);
    expect(noteFailure).toHaveBeenCalledWith("Play Integrity (claim): device_not_trusted");
  });
  it("refuses a failure when enforcing, including a missing token", async () => {
    const v = await verdict({ deviceIntegrity: {} });
    await expect(checkIntegrity(env("enforce"), { action: "claim", deviceKey: KEY, token: TOKEN }, async () => v)).rejects.toMatchObject({ status: 403, code: "integrity_failed" });
    await expect(checkIntegrity(env("enforce"), { action: "claim", deviceKey: KEY, token: undefined }, async () => v)).rejects.toMatchObject({ code: "integrity_failed" });
  });
  it("lets requests through when Google can't be reached", async () => {
    expect(await checkIntegrity(env("enforce"), { action: "claim", deviceKey: KEY, token: TOKEN }, async () => { throw new Error("down"); })).toBe(false);
  });
});
