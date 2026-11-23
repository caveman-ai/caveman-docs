export const dynamic = "force-static";

/* RFC 9727 API catalog. The API and its OpenAPI document live on the product
 * site; this catalog points there so a reader of the docs origin finds them
 * without a copy that could drift. Served by a route so the media type is
 * right: a static file with no extension would go out as octet-stream. */
const CATALOG = {
  linkset: [
    {
      anchor: "https://api.caveman.so/api/v1",
      item: [
        { href: "https://api.caveman.so/api/v1", type: "application/json", title: "Caveman Platform control-plane API" },
        { href: "https://caveman.so/openapi.json", type: "application/vnd.oai.openapi+json;version=3.1", title: "OpenAPI 3.1 document" },
      ],
      "service-desc": [{ href: "https://caveman.so/openapi.json", type: "application/vnd.oai.openapi+json;version=3.1" }],
      "service-doc": [
        { href: "https://caveman.so/auth.md", type: "text/markdown" },
        { href: "https://docs.caveman.so/llms.txt", type: "text/markdown" },
      ],
      status: [{ href: "https://api.caveman.so/api/v1/health/live", type: "application/json" }],
    },
  ],
};

export function GET() {
  return new Response(JSON.stringify(CATALOG, null, 2), {
    headers: {
      "content-type": "application/linkset+json; charset=utf-8",
      "access-control-allow-origin": "*",
      "cache-control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
