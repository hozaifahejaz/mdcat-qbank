/* The site's two looks for the public pages (the landing page and the sign-in screens). "new" is the default; the
   admin panel can switch back to "classic" (Admin > Site theme). Light and dark mode work in both. */
export const looks = ["new", "classic"] as const;
export type Look = (typeof looks)[number];
export const defaultLook: Look = "new";
export const isLook = (v: unknown): v is Look => looks.includes(v as Look);

export const lookNames: Record<Look, { name: string; blurb: string }> = {
  new: { name: "New", blurb: "Light and calm, with floating cards around a big headline. Added November 2026." },
  classic: { name: "Classic", blurb: "The earlier design: grey canvas, rounded white cards and black pill buttons." },
};
