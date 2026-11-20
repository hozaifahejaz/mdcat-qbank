"use client";

import { lazy } from "react";

/* Next puts the not-found page into the data of every other page, so the page itself sits behind this lazy import:
   other pages carry only this small reference, and the not-found page (still fully in out/404.html) loads its code
   when it is shown. */
const NotFoundPage = lazy(() => import("./NotFoundPage"));

export default function NotFoundLazy() {
  return <NotFoundPage />;
}
