import { describe, expect, it } from "vitest";
import { ipKey } from "../http";

describe("ipKey", () => {
  it("leaves IPv4 addresses alone", () => {
    expect(ipKey("203.0.113.7")).toBe("203.0.113.7");
    expect(ipKey("local")).toBe("local");
  });
  it("cuts IPv6 addresses down to their /64 block", () => {
    expect(ipKey("2001:db8:12:3400:aaaa:bbbb:cccc:dddd")).toBe("2001:db8:12:3400::/64");
    expect(ipKey("2001:db8:12:3400::1")).toBe("2001:db8:12:3400::/64");
    expect(ipKey("2001:0DB8:0012:3400:1::2")).toBe("2001:db8:12:3400::/64");
  });
  it("expands a shortened address before cutting", () => {
    expect(ipKey("2001:db8::1")).toBe("2001:db8:0:0::/64");
    expect(ipKey("::1")).toBe("0:0:0:0::/64");
  });
  it("gives two addresses in one block the same key and other blocks another", () => {
    expect(ipKey("2001:db8:1:2:1::")).toBe(ipKey("2001:db8:1:2:ffff:ffff:ffff:ffff"));
    expect(ipKey("2001:db8:1:2::1")).not.toBe(ipKey("2001:db8:1:3::1"));
  });
});
