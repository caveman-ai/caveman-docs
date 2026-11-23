# Caveman Documentation Aggregator (`caveman-ai/docs`)

Serves `docs.caveman.so`. Product documentation lives beside the code inside each owning repository's `docs/` folder; this repository aggregates those folders into one navigation tree, one search index, one `/llms.txt`, and one public-boundary check.

## Source repositories

| Product tab | Source folder |
|---|---|
| Caveman Agents | `caveman-ai/agents/docs/` |
| Caveman Code | `caveman-ai/caveman-code/docs/` |
| Cloud SDK & CLI | `caveman-ai/cloud-sdk/docs/` |
| Local Efficiency | `JuliusBrussee/caveman/docs/` |
| API Reference | `caveman-ai/cloud-sdk/contracts/openapi.json` |

## Run aggregation & boundary gate

```bash
node scripts/aggregate-docs.mjs
```

The script refuses to build if any aggregated page mentions a private Cloud backend path, internal strategy memo, or secret token pattern.
