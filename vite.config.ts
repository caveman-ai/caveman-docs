import { execFile } from "node:child_process";
import { defineConfig, type Plugin } from "vite";
import vinext from "vinext";
import { cloudflare } from "@cloudflare/vite-plugin";
import { staticAssetsAdapter } from "@vinext/cloudflare/cache/static-assets-adapter";

/* Reruns the content build (scripts/build-content.mjs) when a page or the
 * navigation changes under `vite dev`. The build rewrites only the generated
 * files that changed, and Vite reloads from those. Runs are serialised: an
 * edit during a run queues one more. */
function contentBuild(): Plugin {
  return {
    name: "caveman-docs:content",
    apply: "serve",
    configureServer(server) {
      let running = false;
      let queued = false;
      const run = () => {
        if (running) {
          queued = true;
          return;
        }
        running = true;
        execFile(process.execPath, ["scripts/build-content.mjs"], (error, _stdout, stderr) => {
          if (error) server.config.logger.error(stderr.trim() || error.message, { timestamp: true });
          running = false;
          if (queued) {
            queued = false;
            run();
          }
        });
      };
      server.watcher.on("all", (_event, file) => {
        if (file.includes("/node_modules/") || file.includes("/.generated/")) return;
        if (file.endsWith(".mdx") || file.endsWith("/docs.json")) run();
      });
    },
  };
}

export default defineConfig({
  plugins: [
    contentBuild(),
    vinext({
      cache: { cdn: staticAssetsAdapter() },
      prerender: { routes: "*" },
    }),
    cloudflare({
      viteEnvironment: {
        name: "rsc",
        childEnvironments: ["ssr"],
      },
    }),
  ],
});
