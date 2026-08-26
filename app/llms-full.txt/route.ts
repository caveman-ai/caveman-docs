export const dynamic = "force-static";

import { rawSite } from "@/lib/raw-page";

export async function GET() {
  return new Response(await rawSite(), {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
