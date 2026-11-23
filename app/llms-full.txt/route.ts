import { rawSite } from "@/lib/raw-page";

export const dynamic = "force-static";

/** Every page in one Markdown file, in reading order, built from the same source as the HTML. */
export function GET() {
  return new Response(rawSite(), {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "access-control-allow-origin": "*",
    },
  });
}
