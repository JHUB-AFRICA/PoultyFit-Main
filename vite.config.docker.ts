import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { nitro } from "nitro/vite";

// Builds a plain Node.js server instead of a Cloudflare Worker. Used only
// for the Docker image (see Dockerfile), so JHUB can run this app on their
// own servers. The default vite.config.ts (Cloudflare-targeted) is
// untouched and still used for `npx wrangler deploy`.
export default defineConfig({
  plugins: [
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
    nitro(),
  ],
});