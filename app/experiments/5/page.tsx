import type { Metadata } from "next";
import Ascent from "@/components/experiment5/Ascent";
import { site } from "@/lib/site";
import "../../auth.css";
import "./exp5.css";

/* Sign-in experiment 5: "The ascent". A markhor waits at the foot of a Karakoram ridge and climbs one ledge for each
   part of signing in (email, password, sign in), planting a flag on the summit as the account opens. Same sign-in as
   /signin (email and password, Google), same API and device check. The live /signin is unchanged. Noindex. */
export const metadata: Metadata = { title: `Experiment 5 · Sign in · ${site.name}`, robots: { index: false, follow: false } };

export default function Experiment5() {
  return <Ascent />;
}
