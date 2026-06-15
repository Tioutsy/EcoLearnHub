---
name: EcoLearn OpenAPI shared-schema reuse
description: Why reusing one OpenAPI component schema across two endpoints with different payloads breaks the Orval-generated client.
---

When adding a new endpoint, do NOT repurpose an existing shared `components/schemas/*` entry by changing its shape if another endpoint still references it.

**Why:** The dashboard `/dashboard/completion-trend` endpoint reused `TrendPoint`, but `ImpactMetrics.monthlyTrend` (served by `/impact`) also referenced `TrendPoint`. Changing `TrendPoint` to `{completionRate, adoptionRate, activeLearners}` silently broke the `/impact` contract, whose backend still returns `{completions, enrollments}`. The Orval-generated client + zod then mismatched the real `/impact` payload and the frontend `m.completions` reads.

**How to apply:** Each distinct response shape gets its own named schema (e.g. `TrendPoint` for dashboard trend, `MonthlyTrendPoint` for impact trend). After any openapi.yaml change, grep for every `$ref` to the schema you touched to confirm no other endpoint depends on the old shape, then run `pnpm --filter @workspace/api-spec run codegen` and typecheck the frontend pages that consume it.
