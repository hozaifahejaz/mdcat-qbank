import type { Metadata } from "next";
import Ascent from "@/components/experiment5/Ascent";
import { site } from "@/lib/site";
import "../../auth.css";
import "../5/exp5.css";

/* Sign-up experiment 6: the same climb as sign-in experiment 5, with one more ledge (name, email, password, then the
   summit as the account is created or its confirmation link is sent). Same sign-up as /signup, same API. The live
   /signup is unchanged. Noindex. */
export const metadata: Metadata = { title: `Experiment 6 · Create your account · ${site.name}`, robots: { index: false, follow: false } };

export default function Experiment6() {
  return <Ascent mode="signup" />;
}
