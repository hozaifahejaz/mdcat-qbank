import type { NextConfig } from "next";

/* Static export: `npm run build` writes plain files to out/, which Cloudflare Pages serves.
   Pages that need a server (sign-in, payments) will move to the OpenNext Cloudflare adapter when they're built. */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "export",
};

export default nextConfig;
