import type { Metadata } from "next";
import Experiment2 from "@/components/experiment2/Experiment2";
import { site } from "@/lib/site";
import "./exp2.css";

export const metadata: Metadata = { title: `Experiment 2 · ${site.name}`, robots: { index: false } };

export default function Page() {
  return <Experiment2 />;
}
