---
name: Orval generated query hooks
description: Gotcha when passing query options to generated useGet*/useList* hooks
---

# Orval generated query hooks

When passing `query` options (e.g. `enabled`) to an orval-generated
`useGet*`/`useList*` hook in `@workspace/api-client-react`, you MUST also pass
an explicit `queryKey` or tsc fails with TS2741 ("Property 'queryKey' is
missing"). Example:
`useGetX({ query: { enabled: cond, queryKey: ["x"], retry: false } })`.
