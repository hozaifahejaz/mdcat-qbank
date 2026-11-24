import { describe, expect, it } from "vitest";
import { banks } from "../../lib/banks";
import { LEGACY, areas, bankAmong, banksFor, cleanExams, exams, signupHref, startHref } from "../../lib/exams";
import { allowedBanks, bankFor, mayUse } from "../exams";
import { chosen } from "../users";

const ids = (list: { id: string }[]) => list.map((b) => b.id);

describe("the list of areas and exams", () => {
  it("only names banks and areas that exist", () => {
    for (const e of exams) {
      expect(areas.some((a) => a.id === e.area)).toBe(true);
      expect(e.banks).toContain(e.bank);
      for (const b of e.banks) expect(banks.some((x) => x.id === b)).toBe(true);
    }
  });

  it("opens an exam's own bank and the textbooks under it", () => {
    expect(ids(banksFor(["nums"]))).toEqual(["fsc1", "fsc2", "nums"]);
    expect(ids(banksFor(["mdcat", "aku"]))).toEqual(["fsc1", "fsc2", "mdcat", "aku"]);
    expect(ids(banksFor(["fsc2"]))).toEqual(["fsc2"]);
  });

  it("keeps only known exams of the one area", () => {
    expect(cleanExams("medical", "nums,mdcat,ecat,nums")).toEqual(["mdcat", "nums"]);
    expect(cleanExams("medical", ["aku", 7, "x"])).toEqual(["aku"]);
    expect(cleanExams("nowhere", "mdcat")).toEqual([]);
    expect(cleanExams(null, "mdcat")).toEqual([]);
  });

  it("never picks a bank outside the student's own", () => {
    const nums = banksFor(["nums"]);
    expect(bankAmong(nums, "nums")?.id).toBe("nums");
    expect(bankAmong(nums, "mdcat")?.id).toBe("nums");
    expect(bankAmong(nums, null)?.id).toBe("nums");
    expect(bankAmong(nums, "aku", "fsc1")?.id).toBe("fsc1");
    expect(bankAmong(banksFor(["mdcat", "nums"]), null)?.id).toBe("mdcat");
    expect(bankAmong(banksFor(["fsc2"]), "mdcat")?.id).toBe("fsc2");
  });

  it("carries the pick through sign-up inside next", () => {
    expect(signupHref()).toBe("/signup");
    const href = signupHref({ area: "medical", exam: "nums", then: "/checkout?plan=season" });
    const next = new URL(href, "https://x").searchParams.get("next")!;
    expect(next.startsWith("/welcome?")).toBe(true);
    const q = new URL(next, "https://x").searchParams;
    expect([q.get("area"), q.get("exam"), q.get("next")]).toEqual(["medical", "nums", "/checkout?plan=season"]);
    expect(startHref("law")).toBe("/signup");
    expect(startHref("law", "/checkout?plan=season")).toBe("/signup?next=%2Fcheckout%3Fplan%3Dseason");
  });
});

describe("what an account is served", () => {
  it("reads an account's choice", () => {
    expect(chosen({ area: "medical", exams: "nums,aku" })).toEqual({ area: "medical", exams: ["nums", "aku"] });
    // Not chosen yet.
    expect(chosen({ area: null, exams: null })).toEqual({ area: null, exams: [] });
    expect(chosen({ area: "medical", exams: "" })).toEqual({ area: null, exams: [] });
    // Columns that couldn't be read: as every account was before.
    expect(chosen({})).toEqual({ area: LEGACY.area, exams: LEGACY.exams });
  });

  it("serves a student only their exams' banks", () => {
    const s = { role: "student", area: "medical", exams: "nums" };
    expect(ids(allowedBanks(s))).toEqual(["fsc1", "fsc2", "nums"]);
    expect(mayUse(allowedBanks(s), "mdcat")).toBe(false);
    expect(bankFor(allowedBanks(s), "mdcat").id).toBe("nums");
    expect(bankFor(allowedBanks(s), "fsc1").id).toBe("fsc1");
    expect(bankFor(allowedBanks(s), 42).id).toBe("nums");
  });

  it("gives staff every bank, and an account with no choice what it had before", () => {
    expect(allowedBanks({ role: "admin", area: null, exams: null })).toEqual(banks);
    expect(ids(allowedBanks({ role: "student", area: null, exams: null }))).toEqual(ids(banks));
    expect(ids(allowedBanks({ role: "student" }))).toEqual(ids(banks));
  });
});
